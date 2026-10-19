export type CloudProvider = "AWS" | "GCP" | "AZURE" | "OCI";

export type VerificationStatus = "verified" | "partial" | "not_found" | "no_api";

export interface MigrationAttentionPoint {
  service: string;
  status: Exclude<VerificationStatus, "verified">;
  reason: string;
}

export interface MigrationComplexityDetails {
  basis: "catalog_compatibility";
  isMigration: boolean;
  summary: string;
  verifiedServices: number;
  totalServices: number;
  coveredCostPct: number;
  attentionPoints: MigrationAttentionPoint[];
  disclaimer: string;
}

export interface BillingLineItem {
  sourceKey?: string;
  provider: CloudProvider;
  serviceCode: string;
  serviceName?: string;
  skuId?: string;
  meterId?: string;
  nativeSkuName?: string;
  nativeProductId?: string;
  usageType?: string;
  operation?: string;
  region: string;
  resourceId?: string;
  quantity: number;
  unit: string;
  cost: number;
  currency: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface TopService {
  sourceLineItemKey?: string;
  name: string;
  specs: string;
  cost: number;
  pct: number;
  quantity: string;
  nativeSkuName?: string;
  nativeProductId?: string;
  region?: string;
  operatingSystem?: string;
  architecture?: string;
  vcpu?: number;
  memoryGiB?: number;
  usageQuantity?: number;
  usageUnit?: string;
}

export interface ParsedBilling {
  provider: CloudProvider;
  period: { start: string; end: string };
  currency: string;
  totalCost: number;
  dataQuality: "good" | "partial" | "poor";
  targetRegion?: string;
  topServices: TopService[];
  lineItems?: BillingLineItem[];
}

interface PriceEntry {
  price: number | null;
  unit?: string;
  currency?: string;
  estimatedMonthly?: number | null;
  source?: string;
  effectiveFrom?: string;
  catalogOfferingId?: string;
  verified: boolean;
  reason?: string;
}

interface ClassifiedPrice {
  service: string;
  currentCost: number;
  gcp: PriceEntry;
  azure: PriceEntry;
  oci: PriceEntry;
  aws: PriceEntry;
  gcpStatus: VerificationStatus;
  azureStatus: VerificationStatus;
  ociStatus: VerificationStatus;
  awsStatus: VerificationStatus;
}

export interface PipelineResult {
  meta: {
    analyzedServices: number;
    verifiedServices: number;
    partialServices: number;
    notFoundServices: number;
    coveredCostPct: number;
    analysisDate: string;
  };
  billing: ParsedBilling;
  mappings: unknown;
  prices: {
    classified: ClassifiedPrice[];
    meta: Omit<PipelineResult["meta"], "analysisDate">;
  };
  recommendation: {
    recommendation: {
      provider: CloudProvider;
      basedOnVerified: boolean;
      migrationComplexity: string;
      migrationComplexityDetails?: MigrationComplexityDetails;
      reasons: string[];
      topServices: string[];
      cfa_justification: string;
    };
    insights: string[];
    summary: string;
  };
  payback: {
    payback: {
      basedOnVerified: boolean;
      coveredCostPct: number;
      monthlySaving: number;
      migrationCost: number;
      paybackMonths: number;
      roi12m: number;
      roi24m: number;
      roi36m: number;
      breakEvenMonth: number;
      disclaimer: string;
    };
  };
}

export type PipelineStep =
  | "mapping"
  | "pricing"
  | "classification"
  | "recommendation"
  | "payback"
  | "done"
  | "error";

export interface PipelineProgressEvent {
  step: PipelineStep;
  message: string;
  data?: Partial<PipelineResult>;
}

export interface ServiceCost {
  name: string;
  cost: number;
  percentage: number;
}

export type ServiceCategory =
  | "Computação"
  | "Containers e serverless"
  | "Banco de dados"
  | "Armazenamento"
  | "Rede"
  | "Segurança"
  | "Observabilidade"
  | "Outros";

export interface CrossCloudRow {
  provider: CloudProvider;
  estimatedCost: number | null;
  saving: number | null;
  savingPct: number | null;
  isCurrentProvider: boolean;
  coveredCostPct: number;
}

export interface ServiceCompRow {
  name: string;
  currentCost: number;
  aws: number | null;
  gcp: number | null;
  azure: number | null;
  oci: number | null;
  statuses: Record<"aws" | "gcp" | "azure" | "oci", VerificationStatus>;
  reasons: Partial<Record<"aws" | "gcp" | "azure" | "oci", string>>;
}

export interface RecommendationView {
  provider: CloudProvider;
  basedOnVerified: boolean;
  estimatedCost: number;
  saving: number;
  savingPct: number;
  migrationComplexity: string;
  migrationComplexityDetails?: MigrationComplexityDetails;
  reasons: string[];
  topServices: string[];
  cfa_justification?: string;
}

export interface BillingViewModel {
  provider: CloudProvider;
  period: { start: string; end: string };
  totalCost: number;
  currency: string;
  services: ServiceCost[];
  categories: ServiceCost[];
  dailyTotals: Array<{ date: string; total: number }>;
  crossCloud: CrossCloudRow[];
  serviceComparison: ServiceCompRow[];
  freeTierOpportunities?: Array<{
    provider: string;
    service: string;
    description: string;
    monthlySaving: number;
    eligible: boolean;
  }>;
  recommendation: RecommendationView;
  insights: string[];
  summary: string;
  meta: PipelineResult["meta"];
  payback: PipelineResult["payback"]["payback"];
}

const PROVIDERS: CloudProvider[] = ["AWS", "GCP", "AZURE", "OCI"];

export function toBillingViewModel(result: PipelineResult): BillingViewModel {
  const { billing, prices } = result;
  const services = billing.topServices.map((service) => ({
    name: service.name,
    cost: service.cost,
    percentage: service.pct,
    category: categoryForService(service, billing.lineItems ?? []),
  }));
  const crossCloud = PROVIDERS.map((provider) =>
    buildProviderProjection(result, provider),
  );
  const recommendationProvider = result.recommendation.recommendation.provider;
  const recommendedProjection = crossCloud.find(
    (row) => row.provider === recommendationProvider,
  );
  const estimatedCost = recommendedProjection?.estimatedCost ?? billing.totalCost;
  const saving = recommendedProjection?.saving ?? 0;
  const savingPct = recommendedProjection?.savingPct ?? 0;

  return {
    provider: billing.provider,
    period: billing.period,
    totalCost: billing.totalCost,
    currency: billing.currency,
    services: services.map((service) => ({
      name: service.name,
      cost: service.cost,
      percentage: service.percentage,
    })),
    categories: aggregateCategories(services, billing.totalCost),
    dailyTotals: [],
    crossCloud,
    serviceComparison: prices.classified.map((price) => ({
      name: price.service,
      currentCost: price.currentCost,
      aws: costFor(price, "AWS", billing.provider, billing.currency),
      gcp: costFor(price, "GCP", billing.provider, billing.currency),
      azure: costFor(price, "AZURE", billing.provider, billing.currency),
      oci: costFor(price, "OCI", billing.provider, billing.currency),
      statuses: {
        aws: price.awsStatus,
        gcp: price.gcpStatus,
        azure: price.azureStatus,
        oci: price.ociStatus,
      },
      reasons: {
        aws: price.aws.reason,
        gcp: price.gcp.reason,
        azure: price.azure.reason,
        oci: price.oci.reason,
      },
    })),
    recommendation: {
      provider: recommendationProvider,
      basedOnVerified: result.recommendation.recommendation.basedOnVerified,
      estimatedCost,
      saving,
      savingPct,
      migrationComplexity: complexityLabel(
        result.recommendation.recommendation.migrationComplexity,
      ),
      migrationComplexityDetails:
        result.recommendation.recommendation.migrationComplexityDetails,
      reasons: result.recommendation.recommendation.reasons,
      topServices: result.recommendation.recommendation.topServices,
      cfa_justification:
        result.recommendation.recommendation.cfa_justification,
    },
    insights: result.recommendation.insights,
    summary: result.recommendation.summary,
    meta: result.meta,
    payback: result.payback.payback,
  };
}

function aggregateCategories(
  services: Array<ServiceCost & { category: ServiceCategory }>,
  totalCost: number,
): ServiceCost[] {
  const totals = new Map<ServiceCategory, number>();
  services.forEach((service) => {
    totals.set(service.category, (totals.get(service.category) ?? 0) + service.cost);
  });

  return Array.from(totals, ([name, cost]) => ({
    name,
    cost: rounded(cost),
    percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
  })).sort((a, b) => b.cost - a.cost);
}

function categoryForService(
  service: TopService,
  lineItems: BillingLineItem[],
): ServiceCategory {
  const lineItem = lineItems.find((item) =>
    service.sourceLineItemKey
      ? item.sourceKey === service.sourceLineItemKey
      : item.serviceName === service.name || item.serviceCode === service.name,
  );
  const attributes = lineItem?.attributes
    ? Object.values(lineItem.attributes).join(" ")
    : "";
  const searchable = normalizeCategoryText([
    service.name,
    service.specs,
    service.nativeSkuName,
    lineItem?.serviceCode,
    lineItem?.serviceName,
    lineItem?.usageType,
    lineItem?.operation,
    attributes,
  ].filter(Boolean).join(" "));

  if (matchesCategory(searchable, [
    "data transfer", "data_transfer", "datatransfer", "bandwidth", "network",
    "vpc", "vpn", "load balanc", "load_balanc", "nat gateway", "cloud nat",
    "cloudfront", "cdn", "dns", "route 53", "traffic",
  ])) return "Rede";

  if (matchesCategory(searchable, [
    "kubernetes", "container", "serverless", "lambda", "cloud function",
    "cloud run", "function app", "app service", "eks", "aks", "gke", "oke",
  ])) return "Containers e serverless";

  if (matchesCategory(searchable, [
    "database", "postgres", "mysql", "mariadb", "oracle db", "sql server",
    "cloud sql", "rds", "aurora", "dynamodb", "cosmos db", "spanner",
    "bigtable", "redis", "cache", "db system", "managed db",
  ])) return "Banco de dados";

  if (matchesCategory(searchable, [
    "storage", "object store", "object_store", "block store", "block_storage",
    "blob", "bucket", "volume", "disk", "s3", "ebs", "efs", "filestore",
  ])) return "Armazenamento";

  if (matchesCategory(searchable, [
    "security", "firewall", "waf", "shield", "defender", "key vault",
    "kms", "secret manager", "cloud guard", "security center",
  ])) return "Segurança";

  if (matchesCategory(searchable, [
    "observability", "monitor", "logging", "log analytics", "cloudwatch",
    "cloud trace", "cloud audit", "application insights", "metrics",
  ])) return "Observabilidade";

  if (matchesCategory(searchable, [
    "compute", "virtual machine", "virtual machines", "instance", "ec2",
    "vmware", "bare metal", "machine type", "shape",
  ])) return "Computação";

  return "Outros";
}

function normalizeCategoryText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesCategory(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function buildProviderProjection(
  result: PipelineResult,
  provider: CloudProvider,
): CrossCloudRow {
  const { billing } = result;
  if (provider === billing.provider) {
    return {
      provider,
      estimatedCost: billing.totalCost,
      saving: 0,
      savingPct: 0,
      isCurrentProvider: true,
      coveredCostPct: 100,
    };
  }

  const covered = result.prices.classified.filter((price) => {
    const { entry, status } = providerSnapshot(price, provider);
    return (
      status === "verified" &&
      entry.estimatedMonthly != null &&
      (!entry.currency || entry.currency === billing.currency)
    );
  });

  if (!covered.length) {
    return {
      provider,
      estimatedCost: null,
      saving: null,
      savingPct: null,
      isCurrentProvider: false,
      coveredCostPct: 0,
    };
  }

  const currentCovered = covered.reduce(
    (sum, price) => sum + price.currentCost,
    0,
  );
  const targetCovered = covered.reduce(
    (sum, price) =>
      sum + (providerSnapshot(price, provider).entry.estimatedMonthly ?? 0),
    0,
  );
  const saving = currentCovered - targetCovered;
  const estimatedCost = billing.totalCost - saving;

  return {
    provider,
    estimatedCost: rounded(estimatedCost),
    saving: rounded(saving),
    savingPct:
      billing.totalCost > 0
        ? rounded((saving / billing.totalCost) * 100)
        : 0,
    isCurrentProvider: false,
    coveredCostPct:
      billing.totalCost > 0
        ? Math.min(100, Math.round((currentCovered / billing.totalCost) * 100))
        : 0,
  };
}

function costFor(
  price: ClassifiedPrice,
  provider: CloudProvider,
  sourceProvider: CloudProvider,
  billingCurrency: string,
): number | null {
  if (provider === sourceProvider) return price.currentCost;
  const { entry, status } = providerSnapshot(price, provider);
  if (
    status !== "verified" ||
    !entry.verified ||
    (entry.currency && entry.currency !== billingCurrency)
  ) {
    return null;
  }
  return entry.estimatedMonthly ?? null;
}

function providerSnapshot(price: ClassifiedPrice, provider: CloudProvider) {
  if (provider === "AWS") return { entry: price.aws, status: price.awsStatus };
  if (provider === "GCP") return { entry: price.gcp, status: price.gcpStatus };
  if (provider === "AZURE") {
    return { entry: price.azure, status: price.azureStatus };
  }
  return { entry: price.oci, status: price.ociStatus };
}

function complexityLabel(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized === "low" || normalized === "baixa") return "Baixa";
  if (normalized === "high" || normalized === "alta") return "Alta";
  return "Média";
}

function rounded(value: number): number {
  return Number(value.toFixed(2));
}
