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
  const recordType = pickText(row, RECORD_TYPE_FIELDS);
  if (/total$/i.test(recordType)) return null;

  const serviceName = pickText(row, SERVICE_NAME_FIELDS);
  const serviceCode = pickText(row, SERVICE_CODE_FIELDS) || serviceName;
  const usageType = pickText(row, USAGE_TYPE_FIELDS);
  const region =
    pickText(row, REGION_FIELDS) ||
    inferRegion(provider, serviceCode, usageType);
  const cost = pickNumber(row, COST_FIELDS);
  if (!serviceCode || !region || cost == null) return null;

  const explicitSkuName = pickText(row, SKU_NAME_FIELDS);
  const description = pickText(row, DESCRIPTION_FIELDS);
  const nativeSkuName =
    explicitSkuName || extractNativeSku(provider, usageType, description);
  const quantity = pickNumber(row, QUANTITY_FIELDS) ?? 0;
  const currency = (
    pickText(row, CURRENCY_FIELDS) || inferCurrencyFromHeaders(row) || "USD"
  ).toUpperCase();
  const startDate = optionalDate(pickText(row, START_DATE_FIELDS));
  const endDate = optionalDate(pickText(row, END_DATE_FIELDS));
  const attributes: Record<string, string | number | boolean> = {};
  const vcpu = pickNumber(row, VCPU_FIELDS);
  const memoryGiB = pickNumber(row, MEMORY_FIELDS);
  const architecture =
    pickText(row, ARCHITECTURE_FIELDS) ||
    inferArchitecture(provider, nativeSkuName);
  const operatingSystem = pickText(row, OPERATING_SYSTEM_FIELDS);
  const operation = pickText(row, OPERATION_FIELDS);
  const databaseEngine =
    pickText(row, DATABASE_ENGINE_FIELDS) ||
    inferDatabaseEngine(provider, serviceCode, description, operation);
  if (vcpu != null) attributes.vcpu = vcpu;
  if (memoryGiB != null) attributes.memoryGiB = memoryGiB;
  if (architecture) attributes.architecture = architecture;
  if (operatingSystem) attributes.operatingSystem = operatingSystem;
  if (databaseEngine) attributes.databaseEngine = databaseEngine;

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
    operation: operation || undefined,
    region,
    resourceId: pickText(row, RESOURCE_ID_FIELDS) || undefined,
    quantity,
    unit: pickText(row, UNIT_FIELDS) || inferUnit(provider, usageType),
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
  const normalized = normalizeNumber(raw);
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

function normalizeNumber(value: string): string {
  const commaCount = (value.match(/,/g) ?? []).length;
  const dotCount = (value.match(/\./g) ?? []).length;

  if (commaCount && dotCount) {
    return value.lastIndexOf(",") > value.lastIndexOf(".")
      ? value.replace(/\./g, "").replace(",", ".")
      : value.replace(/,/g, "");
  }
  if (commaCount > 1 && /^-?\d{1,3}(?:,\d{3})+$/.test(value)) {
    return value.replace(/,/g, "");
  }
  if (dotCount > 1 && /^-?\d{1,3}(?:\.\d{3})+$/.test(value)) {
    return value.replace(/\./g, "");
  }
  if (commaCount === 1) return value.replace(",", ".");
  return value;
}

function extractNativeSku(
  provider: CloudProvider,
  usageType: string,
  description: string,
): string {
  const source = `${usageType} ${description}`;
  if (provider === "AWS") {
    const sku =
      source.match(
        /\b(?:(?:db|cache)\.)?[a-z]+\d[a-z0-9-]*\.(?:\d+xlarge|\d+xl|xlarge|xl|nano|micro|small|medium|large|metal)\b/i,
      )?.[0] ?? "";
    return sku
      .replace(/\.(\d+)xl$/i, ".$1xlarge")
      .replace(/\.xl$/i, ".xlarge");
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

function inferRegion(
  provider: CloudProvider,
  serviceCode: string,
  usageType: string,
): string {
  if (provider === "GCP") return "global";
  if (provider !== "AWS") return "";

  const explicitRegion = usageType.match(
    /^(af|ap|ca|eu|il|me|mx|sa|us)-(?:gov-)?[a-z0-9-]+-\d(?=-|:|$)/i,
  )?.[0];
  if (explicitRegion) return explicitRegion.toLowerCase();

  const billingPrefix = usageType.match(/^([A-Z0-9]+)-/)?.[1];
  if (billingPrefix && AWS_BILLING_REGION_PREFIXES[billingPrefix]) {
    return AWS_BILLING_REGION_PREFIXES[billingPrefix];
  }

  if (AWS_GLOBAL_SERVICE_CODES.has(normalizeKey(serviceCode))) return "global";

  // Nos relatórios de billing da AWS, a região us-east-1 omite o prefixo.
  return usageType ? "us-east-1" : "";
}

function inferCurrencyFromHeaders(row: NormalizedRow): string {
  if (row.has("unroundedcostr") || row.has("costr")) return "BRL";
  if (row.has("unroundedcostusd") || row.has("costusd")) return "USD";
  if (row.has("unroundedcosteur") || row.has("costeur")) return "EUR";
  return "";
}

function inferUnit(provider: CloudProvider, usageType: string): string {
  if (provider !== "AWS" || !usageType) return "unit";
  if (/kms-keys/i.test(usageType)) return "Key-Mo";
  if (/gb-?seconds?/i.test(usageType)) return "GB-Seconds";
  if (/v?cpu-?hours?|vcpu-?hrs?/i.test(usageType)) return "vCPU-Hours";
  if (/bytehrs|storage.*bytes?/i.test(usageType)) return "GB-Mo";
  if (/bytes?/i.test(usageType)) return "GB";
  if (/iops/i.test(usageType)) return "IOPS-Mo";
  if (/requests?|queries|api-?calls?/i.test(usageType)) return "Requests";
  if (
    /boxusage|spotusage|heavyusage|instanceusage|hostusage|nodeusage|hours?|hrs?/i.test(
      usageType,
    )
  ) {
    return "Hrs";
  }
  return "unit";
}

function inferArchitecture(
  provider: CloudProvider,
  nativeSkuName: string,
): string {
  if (provider !== "AWS" || !nativeSkuName) return "";
  const family = nativeSkuName
    .replace(/^(?:db|cache)\./i, "")
    .split(".")[0]
    .toLowerCase();
  return /\d+g[a-z]*$/.test(family) ? "arm64" : "x86_64";
}

function inferDatabaseEngine(
  provider: CloudProvider,
  serviceCode: string,
  description: string,
  operation: string,
): string {
  if (provider !== "AWS" || normalizeKey(serviceCode) !== "amazonrds") {
    return "";
  }
  const evidence = `${description} ${operation}`.toLowerCase();
  if (evidence.includes("postgres") || /:(?:0014|0021)\b/.test(evidence)) {
    return "PostgreSQL";
  }
  if (evidence.includes("mysql") || /:0002\b/.test(evidence)) return "MySQL";
  return "";
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
  "ProductCode",
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
  "Unrounded Cost (R$)",
  "Cost (R$)",
  "lineItem/UnblendedCost",
  "lineItem/BlendedCost",
  "TotalCost",
  "CostBeforeTax",
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
  "BillingPeriodStartDate",
  "lineItem/UsageStartDate",
  "UsageStartDate",
  "usage_start_time",
  "UsageDateTime",
  "Date",
  "startTime",
];
const END_DATE_FIELDS = [
  "periodEnd",
  "bill/BillingPeriodEndDate",
  "BillingPeriodEndDate",
  "lineItem/UsageEndDate",
  "UsageEndDate",
  "usage_end_time",
  "endTime",
];
const DESCRIPTION_FIELDS = [
  "description",
  "ItemDescription",
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
const DATABASE_ENGINE_FIELDS = [
  "databaseEngine",
  "product/databaseEngine",
  "engine",
];
const RECORD_TYPE_FIELDS = ["recordType", "lineItem/LineItemType"];

const AWS_GLOBAL_SERVICE_CODES = new Set(
  [
    "AWS Cost Explorer",
    "AWS Support",
    "Amazon CloudFront",
    "Amazon Route 53",
    "Savings Plans for AWS Compute usage",
    "Tax",
  ].map(normalizeKey),
);

const AWS_BILLING_REGION_PREFIXES: Record<string, string> = {
  AFS1: "af-south-1",
  APN1: "ap-northeast-1",
  APN2: "ap-northeast-2",
  APN3: "ap-northeast-3",
  APE1: "ap-east-1",
  APS1: "ap-southeast-1",
  APS2: "ap-southeast-2",
  APS3: "ap-south-1",
  APS4: "ap-southeast-3",
  APS5: "ap-southeast-4",
  APS6: "ap-south-2",
  CAN1: "ca-central-1",
  CAW1: "ca-west-1",
  EU: "eu-west-1",
  EUC1: "eu-central-1",
  EUC2: "eu-central-2",
  EUN1: "eu-north-1",
  EUS1: "eu-south-1",
  EUS2: "eu-south-2",
  EUW2: "eu-west-2",
  EUW3: "eu-west-3",
  ILC1: "il-central-1",
  MEC1: "me-central-1",
  MES1: "me-south-1",
  MXC1: "mx-central-1",
  SAE1: "sa-east-1",
  USE1: "us-east-1",
  USE2: "us-east-2",
  USW1: "us-west-1",
  USW2: "us-west-2",
};
