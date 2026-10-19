import type { ParsedBilling } from "@/lib/billing-contract";
import { BillingParseError } from "@/lib/billing-parser";

type Fetcher = typeof fetch;

interface BcbRate {
  valor?: unknown;
}

interface PtaxRate {
  cotacaoVenda?: unknown;
}

export async function normalizeBillingCurrency(
  billing: ParsedBilling,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<ParsedBilling> {
  if (billing.currency.toUpperCase() !== "BRL") return billing;

  const rate = await averageBrlPerUsd(
    billing.period.start,
    billing.period.end,
    signal,
    fetcher,
  );
  const lineItems = billing.lineItems?.map((item) => ({
    ...item,
    cost: rounded(item.cost / rate, 6),
    currency: "USD",
    attributes: {
      ...item.attributes,
      sourceCurrency: "BRL",
      sourceCost: item.cost,
      exchangeRateBRLPerUSD: rate,
    },
  }));
  const topServices = billing.topServices.map((service) => ({
    ...service,
    cost: rounded(service.cost / rate, 6),
  }));
  const totalCost = rounded(
    lineItems?.reduce((total, item) => total + item.cost, 0) ??
      billing.totalCost / rate,
  );

  return {
    ...billing,
    currency: "USD",
    totalCost,
    lineItems,
    topServices,
  };
}

async function averageBrlPerUsd(
  start: string,
  end: string,
  signal: AbortSignal | undefined,
  fetcher: Fetcher,
): Promise<number> {
  try {
    return await averageFromSgs(start, end, signal, fetcher);
  } catch (error) {
    if (signal?.aborted) throw error;
    try {
      return await averageFromPtax(start, end, signal, fetcher);
    } catch (fallbackError) {
      if (signal?.aborted) throw fallbackError;
      const detail = fallbackError instanceof Error
        ? fallbackError.message
        : "erro desconhecido";
      throw new BillingParseError(
        `Não foi possível converter o billing de BRL para USD com a cotação oficial do Banco Central (${detail}). Tente novamente.`,
      );
    }
  }
}

async function averageFromSgs(
  start: string,
  end: string,
  signal: AbortSignal | undefined,
  fetcher: Fetcher,
): Promise<number> {
  const query = new URLSearchParams({
    formato: "json",
    dataInicial: formatBcbDate(start),
    dataFinal: formatBcbDate(end),
  });
  const payload = await fetchJson<BcbRate[]>(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?${query.toString()}`,
    signal,
    fetcher,
  );
  return average(payload.map((entry) => parseRate(entry.valor)));
}

async function averageFromPtax(
  start: string,
  end: string,
  signal: AbortSignal | undefined,
  fetcher: Fetcher,
): Promise<number> {
  const query = new URLSearchParams({
    "@dataInicial": `'${formatPtaxDate(start)}'`,
    "@dataFinalCotacao": `'${formatPtaxDate(end)}'`,
    "$format": "json",
  });
  const payload = await fetchJson<{ value?: PtaxRate[] }>(
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
      "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?" +
      query.toString(),
    signal,
    fetcher,
  );
  return average((payload.value ?? []).map((entry) => parseRate(entry.cotacaoVenda)));
}

async function fetchJson<T>(
  url: string,
  signal: AbortSignal | undefined,
  fetcher: Fetcher,
): Promise<T> {
  const response = await fetcher(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("json")) {
    throw new Error(`resposta inválida (${contentType || "sem content-type"})`);
  }
  return response.json() as Promise<T>;
}

function average(values: Array<number | null>): number {
  const rates = values.filter(
    (value): value is number => value !== null && value > 0,
  );
  if (!rates.length) throw new Error("período sem cotação");
  return rounded(
    rates.reduce((total, value) => total + value, 0) / rates.length,
    6,
  );
}

function formatBcbDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new BillingParseError(`Data inválida no billing: ${value}`);
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatPtaxDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new BillingParseError(`Data inválida no billing: ${value}`);
  return `${match[2]}-${match[3]}-${match[1]}`;
}

function parseRate(value: unknown): number | null {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function rounded(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}
