import type {
  BillingLineItem,
  CloudProvider,
  ParsedBilling,
  TopService,
} from "@/lib/billing-contract";

type SourceRow = Record<string, unknown>;
type NormalizedRow = Map<string, unknown>;

export class BillingParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingParseError";
  }
}

export function parseBillingFile(
  content: string,
  filename: string,
  targetRegion?: string,
): ParsedBilling {
  const trimmed = content.replace(/^\uFEFF/, "").trim();
  if (!trimmed) throw new BillingParseError("O arquivo está vazio.");

  if (looksLikeJson(trimmed, filename)) {
    const parsed = parseJson(trimmed);
    const structured = parseStructuredBilling(parsed, targetRegion);
    if (structured) return structured;

    const records = extractJsonRecords(parsed);
    if (!records.length) {
      throw new BillingParseError(
        "JSON sem lineItems ou lista de registros de billing reconhecível.",
      );
    }
    return parseRecords(records, filename, targetRegion);
  }

  return parseRecords(parseDelimited(trimmed), filename, targetRegion);
}

function parseStructuredBilling(
  value: unknown,
  targetRegion?: string,
): ParsedBilling | null {
  if (!isRecord(value)) return null;
  const provider = value.provider;
  if (!isProvider(provider)) return null;
  if (!isRecord(value.period)) return null;

  const start = text(value.period.start);
  const end = text(value.period.end);
  const currency = text(value.currency).toUpperCase();
  const totalCost = finiteNumber(value.totalCost);
  const rawLineItems = Array.isArray(value.lineItems) ? value.lineItems : [];
  const rawTopServices = Array.isArray(value.topServices) ? value.topServices : [];

  if (!start || !end || !currency || totalCost == null) {
    throw new BillingParseError(
      "JSON estruturado inválido: period, currency e totalCost são obrigatórios.",
    );
  }

  const lineItems = rawLineItems
    .map((item, index) => normalizeStructuredLineItem(item, provider, currency, index))
    .filter((item): item is BillingLineItem => item !== null);
  const topServices = rawTopServices
    .map(normalizeTopService)
    .filter((item): item is TopService => item !== null);

  if (!lineItems.length && !topServices.length) {
    throw new BillingParseError(
      "JSON estruturado sem itens válidos em lineItems ou topServices.",
    );
  }

  return {
    provider,
    period: { start: dateOnly(start), end: dateOnly(end) },
    currency,
    totalCost,
    dataQuality: isDataQuality(value.dataQuality) ? value.dataQuality : "partial",
    targetRegion: targetRegion || text(value.targetRegion) || undefined,
    topServices,
    lineItems: lineItems.length ? lineItems : undefined,
  };
}

function normalizeStructuredLineItem(
  value: unknown,
  provider: CloudProvider,
  currency: string,
  index: number,
): BillingLineItem | null {
  if (!isRecord(value)) return null;
  const serviceCode = text(value.serviceCode);
  const region = text(value.region);
  const cost = finiteNumber(value.cost);
  const quantity = finiteNumber(value.quantity);
  if (!serviceCode || !region || cost == null || quantity == null) return null;

  return compactObject({
    sourceKey: text(value.sourceKey) || `structured-${index + 1}`,
    provider,
    serviceCode,
    serviceName: optionalText(value.serviceName),
    skuId: optionalText(value.skuId),
    meterId: optionalText(value.meterId),
    nativeSkuName: optionalText(value.nativeSkuName),
    nativeProductId: optionalText(value.nativeProductId),
    usageType: optionalText(value.usageType),
    operation: optionalText(value.operation),
    region,
    resourceId: optionalText(value.resourceId),
    quantity,
    unit: text(value.unit) || "unit",
    cost,
    currency: text(value.currency).toUpperCase() || currency,
    attributes: isRecord(value.attributes)
      ? scalarAttributes(value.attributes)
      : undefined,
  });
}

function normalizeTopService(value: unknown): TopService | null {
  if (!isRecord(value)) return null;
  const name = text(value.name);
  const cost = finiteNumber(value.cost);
  if (!name || cost == null) return null;
  return compactObject({
    sourceLineItemKey: optionalText(value.sourceLineItemKey),
    name,
    specs: text(value.specs) || "specs não informadas",
    cost,
    pct: finiteNumber(value.pct) ?? 0,
    quantity: text(value.quantity) || "quantidade não informada",
    nativeSkuName: optionalText(value.nativeSkuName),
    nativeProductId: optionalText(value.nativeProductId),
    region: optionalText(value.region),
    operatingSystem: optionalText(value.operatingSystem),
    architecture: optionalText(value.architecture),
    vcpu: finiteNumber(value.vcpu) ?? undefined,
    memoryGiB: finiteNumber(value.memoryGiB) ?? undefined,
    usageQuantity: finiteNumber(value.usageQuantity) ?? undefined,
    usageUnit: optionalText(value.usageUnit),
  });
}

function parseRecords(
  records: SourceRow[],
  filename: string,
  targetRegion?: string,
): ParsedBilling {
  if (!records.length) {
    throw new BillingParseError("O arquivo não possui registros de billing.");
  }

  const rows = records.map(normalizeRow);
  const provider = detectProvider(rows, filename);
  const parsed = rows
    .map((row, index) => rowToLineItem(row, provider, index))
    .filter((item): item is DatedLineItem => item !== null)
    .filter((item) => item.cost > 0);

  if (!parsed.length) {
    throw new BillingParseError(
      "Nenhuma linha com serviço, região e custo positivo foi encontrada. Exporte o billing com SKU/medidor, região, quantidade, unidade e custo.",
    );
  }

  const currencies = new Set(parsed.map((item) => item.currency));
  if (currencies.size !== 1) {
    throw new BillingParseError(
      "O arquivo contém mais de uma moeda. Separe o billing por moeda antes de analisar.",
    );
  }

  const dated = parsed.filter((item) => item.startDate || item.endDate);
  if (!dated.length) {
    throw new BillingParseError(
      "Não foi possível identificar o período. Inclua uma coluna de data de uso ou período de cobrança.",
    );
  }

  const lineItems = aggregateLineItems(parsed);
  const allDates = dated.flatMap((item) =>
    [item.startDate, item.endDate].filter((date): date is string => Boolean(date)),
  );
  const start = [...allDates].sort()[0];
  const end = [...allDates].sort().at(-1) ?? start;
  const totalCost = rounded(lineItems.reduce((sum, item) => sum + item.cost, 0));

  return {
    provider,
    period: { start, end },
    currency: [...currencies][0],
    totalCost,
    dataQuality: assessDataQuality(lineItems),
    targetRegion: targetRegion || undefined,
    topServices: [],
    lineItems,
  };
}

interface DatedLineItem extends BillingLineItem {
  startDate?: string;
  endDate?: string;
}

function rowToLineItem(
  row: NormalizedRow,
  provider: CloudProvider,
  index: number,
): DatedLineItem | null {
  const serviceName = pickText(row, SERVICE_NAME_FIELDS);
  const serviceCode = pickText(row, SERVICE_CODE_FIELDS) || serviceName;
  const region = pickText(row, REGION_FIELDS);
  const cost = pickNumber(row, COST_FIELDS);
  if (!serviceCode || !region || cost == null) return null;

  const usageType = pickText(row, USAGE_TYPE_FIELDS);
  const explicitSkuName = pickText(row, SKU_NAME_FIELDS);
  const nativeSkuName =
    explicitSkuName || extractNativeSku(provider, usageType, pickText(row, DESCRIPTION_FIELDS));
  const quantity = pickNumber(row, QUANTITY_FIELDS) ?? 0;
  const currency = (pickText(row, CURRENCY_FIELDS) || "USD").toUpperCase();
  const startDate = optionalDate(pickText(row, START_DATE_FIELDS));
  const endDate = optionalDate(pickText(row, END_DATE_FIELDS));
  const attributes: Record<string, string | number | boolean> = {};
  const vcpu = pickNumber(row, VCPU_FIELDS);
  const memoryGiB = pickNumber(row, MEMORY_FIELDS);
  const architecture = pickText(row, ARCHITECTURE_FIELDS);
  const operatingSystem = pickText(row, OPERATING_SYSTEM_FIELDS);
  if (vcpu != null) attributes.vcpu = vcpu;
  if (memoryGiB != null) attributes.memoryGiB = memoryGiB;
  if (architecture) attributes.architecture = architecture;
  if (operatingSystem) attributes.operatingSystem = operatingSystem;

  return compactObject({
    sourceKey: `file-row-${index + 1}`,
    provider,
    serviceCode,
    serviceName: serviceName || serviceCode,
    skuId: pickText(row, SKU_ID_FIELDS) || undefined,
    meterId: pickText(row, METER_ID_FIELDS) || undefined,
    nativeSkuName: nativeSkuName || undefined,
    nativeProductId: pickText(row, PRODUCT_ID_FIELDS) || undefined,
    usageType: usageType || undefined,
    operation: pickText(row, OPERATION_FIELDS) || undefined,
    region,
    resourceId: pickText(row, RESOURCE_ID_FIELDS) || undefined,
    quantity,
    unit: pickText(row, UNIT_FIELDS) || "unit",
    cost,
    currency,
    attributes: Object.keys(attributes).length ? attributes : undefined,
    startDate,
    endDate,
  });
}

function aggregateLineItems(items: DatedLineItem[]): BillingLineItem[] {
  const aggregated = new Map<string, BillingLineItem>();

  for (const item of items) {
    const key = [
      item.provider,
      item.serviceCode,
      item.skuId ?? "",
      item.meterId ?? "",
      item.nativeSkuName ?? "",
      item.nativeProductId ?? "",
      item.region,
      item.usageType ?? "",
      item.operation ?? "",
      item.unit,
      item.currency,
      JSON.stringify(item.attributes ?? {}),
    ].join("|");
    const current = aggregated.get(key);
    if (current) {
      current.quantity = rounded(current.quantity + item.quantity, 10);
      current.cost = rounded(current.cost + item.cost);
      continue;
    }
    const { startDate, endDate, ...lineItem } = item;
    void startDate;
    void endDate;
    aggregated.set(key, { ...lineItem, sourceKey: `file-${aggregated.size + 1}` });
  }

  return [...aggregated.values()].sort((a, b) => b.cost - a.cost);
}

function assessDataQuality(
  items: BillingLineItem[],
): ParsedBilling["dataQuality"] {
  const complete = items.filter(
    (item) =>
      Boolean(item.nativeSkuName || item.skuId || item.meterId) &&
      Boolean(item.region) &&
      item.quantity > 0 &&
      item.unit !== "unit",
  ).length;
  const ratio = complete / items.length;
  if (ratio >= 0.8) return "good";
  if (ratio >= 0.4) return "partial";
  return "poor";
}

function detectProvider(rows: NormalizedRow[], filename: string): CloudProvider {
  const keys = new Set(rows.flatMap((row) => [...row.keys()]));
  const normalizedFilename = normalizeKey(filename);
  const sampleValues = rows
    .slice(0, 20)
    .flatMap((row) => [...row.values()].map(text))
    .join(" ")
    .toLowerCase();

  if (
    normalizedFilename.includes("aws") ||
    hasAny(keys, ["lineitemproductcode", "lineitemusagetype", "billbillingperiodstartdate"]) ||
    sampleValues.includes("amazonec2")
  ) {
    return "AWS";
  }
  if (
    normalizedFilename.includes("gcp") ||
    normalizedFilename.includes("google") ||
    hasAny(keys, ["servicedescription", "skudescription", "usagestarttime", "locationregion"]) ||
    sampleValues.includes("compute.googleapis.com")
  ) {
    return "GCP";
  }
  if (
    normalizedFilename.includes("azure") ||
    hasAny(keys, ["metercategory", "costinbillingcurrency", "billingcurrencycode", "resourcelocation"]) ||
    sampleValues.includes("microsoft.compute")
  ) {
    return "AZURE";
  }
  if (
    normalizedFilename.includes("oci") ||
    normalizedFilename.includes("oracle") ||
    hasAny(keys, ["productservice", "costreference", "subscriptionid"]) ||
    sampleValues.includes("oracle cloud")
  ) {
    return "OCI";
  }

  throw new BillingParseError(
    "Não foi possível identificar o provedor pelas colunas. Use um export nativo AWS, GCP, Azure ou OCI, ou envie o JSON ParsedBilling.",
  );
}

function parseDelimited(content: string): SourceRow[] {
  const delimiter = detectDelimiter(content);
  const matrix = parseCsvMatrix(content, delimiter);
  if (matrix.length < 2) {
    throw new BillingParseError("CSV sem linhas de dados.");
  }
  const headers = matrix[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  return matrix.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

function parseCsvMatrix(content: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < content.length; index++) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index++;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function detectDelimiter(content: string): string {
  const firstLine = content.split(/\r?\n/, 1)[0];
  const candidates = [",", ";", "\t"];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: firstLine.split(delimiter).length - 1,
    }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function extractJsonRecords(value: unknown): SourceRow[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ["records", "items", "data", "rows", "lineItems"]) {
    if (Array.isArray(value[key])) return value[key].filter(isRecord);
  }
  return [];
}

function normalizeRow(row: SourceRow): NormalizedRow {
  return new Map(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  );
}

function pickText(row: NormalizedRow, aliases: string[]): string {
  for (const alias of aliases) {
    const value = text(row.get(normalizeKey(alias)));
    if (value) return value;
  }
  return "";
}

function pickNumber(row: NormalizedRow, aliases: string[]): number | null {
  for (const alias of aliases) {
    const value = row.get(normalizeKey(alias));
    const parsed = finiteNumber(value);
    if (parsed != null) return parsed;
  }
  return null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = text(value).replace(/[^\d,.-]/g, "");
  if (!raw) return null;
  const normalized = /^-?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(raw)
    ? raw.replace(/\./g, "").replace(",", ".")
    : /^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(raw)
      ? raw.replace(/,/g, "")
      : raw.replace(",", ".");
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

function extractNativeSku(
  provider: CloudProvider,
  usageType: string,
  description: string,
): string {
  const source = `${usageType} ${description}`;
  if (provider === "AWS") {
    return (
      source.match(/(?:db\.)?[a-z][a-z0-9]*\.[a-z0-9]+/i)?.[0] ?? ""
    );
  }
  if (provider === "GCP") {
    return (
      source.match(
        /[a-z][a-z0-9]*-(?:standard|highmem|highcpu|micro|small|medium)-\d+/i,
      )?.[0] ?? ""
    );
  }
  if (provider === "AZURE") {
    return source.match(/Standard_[A-Za-z0-9_]+/i)?.[0] ?? "";
  }
  return source.match(/VM\.[A-Za-z0-9.]+(?:\.Flex)?/i)?.[0] ?? "";
}

function parseJson(content: string): unknown {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new BillingParseError("O arquivo JSON é inválido.");
  }
}

function optionalDate(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function dateOnly(value: string): string {
  const parsed = optionalDate(value);
  if (!parsed) throw new BillingParseError(`Data inválida: ${value}`);
  return parsed;
}

function looksLikeJson(content: string, filename: string): boolean {
  return /\.json$/i.test(filename) || content.startsWith("{") || content.startsWith("[");
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function text(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : "";
}

function optionalText(value: unknown): string | undefined {
  return text(value) || undefined;
}

function isRecord(value: unknown): value is SourceRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProvider(value: unknown): value is CloudProvider {
  return value === "AWS" || value === "GCP" || value === "AZURE" || value === "OCI";
}

function isDataQuality(
  value: unknown,
): value is ParsedBilling["dataQuality"] {
  return value === "good" || value === "partial" || value === "poor";
}

function scalarAttributes(
  value: SourceRow,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string | number | boolean] =>
        ["string", "number", "boolean"].includes(typeof entry[1]),
    ),
  );
}

function compactObject<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ""),
  ) as T;
}

function hasAny(values: Set<string>, candidates: string[]): boolean {
  return candidates.some((candidate) => values.has(candidate));
}

function rounded(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

const SERVICE_NAME_FIELDS = [
  "serviceName",
  "service.description",
  "serviceDescription",
  "lineItem/LineItemDescription",
  "product/ProductName",
  "MeterCategory",
  "ProductName",
  "product/service",
  "service",
];
const SERVICE_CODE_FIELDS = [
  "serviceCode",
  "lineItem/ProductCode",
  "product/servicecode",
  "service.id",
  "ServiceName",
  "ResourceType",
  "product/service",
];
const REGION_FIELDS = [
  "region",
  "product/region",
  "product/regionCode",
  "location.region",
  "location",
  "ResourceLocation",
  "MeterRegion",
  "regionName",
];
const COST_FIELDS = [
  "cost",
  "lineItem/UnblendedCost",
  "lineItem/BlendedCost",
  "CostInBillingCurrency",
  "PreTaxCost",
  "costAmount",
  "computedAmount",
];
const QUANTITY_FIELDS = [
  "quantity",
  "lineItem/UsageAmount",
  "usage.amount",
  "UsageQuantity",
  "ConsumedQuantity",
];
const UNIT_FIELDS = [
  "unit",
  "pricing/unit",
  "lineItem/UsageUnit",
  "usage.unit",
  "UnitOfMeasure",
  "UnitPriceUnit",
];
const CURRENCY_FIELDS = [
  "currency",
  "pricing/currency",
  "CurrencyCode",
  "BillingCurrencyCode",
  "billingCurrency",
];
const SKU_ID_FIELDS = [
  "skuId",
  "sku.id",
  "product/sku",
  "SkuId",
  "PartNumber",
];
const METER_ID_FIELDS = ["meterId", "MeterId", "meter.id", "priceDimensionCode"];
const SKU_NAME_FIELDS = [
  "nativeSkuName",
  "product/instanceType",
  "product/databaseInstanceClass",
  "machineType",
  "armSkuName",
  "SkuName",
  "shape",
];
const PRODUCT_ID_FIELDS = [
  "nativeProductId",
  "product/sku",
  "ProductId",
  "product.id",
];
const USAGE_TYPE_FIELDS = [
  "usageType",
  "lineItem/UsageType",
  "sku.description",
  "MeterName",
  "usageTypeName",
];
const OPERATION_FIELDS = [
  "operation",
  "lineItem/Operation",
  "ChargeType",
  "action",
];
const RESOURCE_ID_FIELDS = [
  "resourceId",
  "lineItem/ResourceId",
  "resource.name",
  "ResourceId",
  "resourceOCID",
];
const START_DATE_FIELDS = [
  "periodStart",
  "bill/BillingPeriodStartDate",
  "lineItem/UsageStartDate",
  "usage_start_time",
  "UsageDateTime",
  "Date",
  "startTime",
];
const END_DATE_FIELDS = [
  "periodEnd",
  "bill/BillingPeriodEndDate",
  "lineItem/UsageEndDate",
  "usage_end_time",
  "endTime",
];
const DESCRIPTION_FIELDS = [
  "description",
  "lineItem/LineItemDescription",
  "sku.description",
  "ProductName",
  "MeterName",
];
const VCPU_FIELDS = ["vcpu", "vcpus", "product/vcpu", "cores"];
const MEMORY_FIELDS = [
  "memoryGiB",
  "memory_gib",
  "product/memory",
  "memory",
];
const ARCHITECTURE_FIELDS = [
  "architecture",
  "product/processorArchitecture",
  "processorArchitecture",
];
const OPERATING_SYSTEM_FIELDS = [
  "operatingSystem",
  "product/operatingSystem",
  "os",
];
