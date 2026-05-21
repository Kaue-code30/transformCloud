"use client";
import { useState, useRef, useEffect } from "react";
import OrlaMascot from "@/app/components/OrlaMascot";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  DollarSign, TrendingDown, Server, AlertCircle, Trophy,
  Loader2, Upload, FileText, X, Sparkles, ChevronDown, ChevronUp,
  CheckCircle, Zap, ArrowRight, Gift, Shield,
} from "lucide-react";

/* ── Tipos ─────────────────────────────────────────── */
interface ServiceCost   { name: string; cost: number; percentage: number }
interface DailyTotal    { date: string; total: number }
interface CrossCloudRow { provider: string; estimatedCost: number; saving: number; savingPct: number; isCurrentProvider: boolean }
interface ServiceCompRow { name: string; currentCost: number; aws: number; gcp: number; azure: number; oci: number }
interface FreeTierOpportunity {
  provider: string;
  service: string;
  description: string;
  monthlySaving: number;
  eligible: boolean;
}

interface Recommendation {
  provider: string;
  estimatedCost: number;
  saving: number;
  savingPct: number;
  migrationComplexity: string;
  reasons: string[];
  topServices: string[];
  caf_justification?: string;
}

interface BillingData {
  provider: string;
  period: { start: string; end: string };
  totalCost: number;
  currency: string;
  services: ServiceCost[];
  dailyTotals: DailyTotal[];
  crossCloud: CrossCloudRow[];
  serviceComparison: ServiceCompRow[];
  freeTierOpportunities?: FreeTierOpportunity[];
  recommendation: Recommendation;
  insights: string[];
  summary: string;
}

/* ── Constantes ────────────────────────────────────── */
const SERVICE_COLORS = ["#b3fe71","#22d3ee","#f59e0b","#f472b6","#818cf8","#34d399","#fb923c","#a78bfa"];
const PROVIDER_COLORS: Record<string, string> = {
  AWS: "#f97316", GCP: "#3b82f6", Azure: "#06b6d4", OCI: "#b3fe71",
};
const COMPLEXITY_COLOR: Record<string, string> = {
  "Baixa": "#b3fe71", "Média": "#f59e0b", "Alta": "#ef4444",
};
const MAX_FILE_BYTES = 400 * 1024;

/* ── Helpers ───────────────────────────────────────── */
function moeda(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function fmtData(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/* ── Sub-componente: tabela de comparação por serviço ── */
function ServiceComparisonTable({ rows, currentProvider }: { rows: ServiceCompRow[]; currentProvider: string }) {
  const providers = ["aws", "gcp", "azure", "oci"] as const;
  const providerLabels = { aws: "AWS", gcp: "GCP", azure: "Azure", oci: "OCI" };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm min-w-[520px]">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--ds-border)" }}>
            <th className="text-left py-2.5 pr-4 font-semibold w-32" style={{ color: "var(--ds-text-5)" }}>Serviço</th>
            <th className="text-right py-2.5 px-3 font-semibold" style={{ color: "var(--ds-text-5)" }}>Atual</th>
            {providers.map((p) => (
              <th
                key={p}
                className="text-right py-2.5 px-3 font-semibold"
                style={{ color: PROVIDER_COLORS[providerLabels[p]] }}
              >
                {providerLabels[p]}
                {providerLabels[p].toLowerCase() === currentProvider.toLowerCase() && (
                  <span className="ml-1 text-[9px] font-normal" style={{ color: "var(--ds-text-5)" }}>(atual)</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const vals = providers.map((p) => row[p]);
            const minVal = Math.min(...vals);
            return (
              <tr key={i} className="border-b transition-colors" style={{ borderColor: "var(--ds-border-sub)" }}>
                <td className="py-3 pr-4 font-medium truncate max-w-[120px]" style={{ color: "var(--ds-muted)" }}>{row.name}</td>
                <td className="py-3 px-3 text-right font-bold" style={{ color: "var(--ds-text)" }}>{moeda(row.currentCost)}</td>
                {providers.map((p) => {
                  const val = row[p];
                  const isBest = val === minVal;
                  const diff = val - row.currentCost;
                  const diffPct = row.currentCost > 0 ? ((diff / row.currentCost) * 100).toFixed(0) : "0";
                  return (
                    <td key={p} className="py-3 px-3 text-right">
                      <span className={`font-semibold ${isBest ? "text-[var(--ds-accent)]" : ""}`} style={!isBest ? { color: "var(--ds-text-3)" } : undefined}>
                        {moeda(val)}
                      </span>
                      <br />
                      <span className={`text-[10px] ${diff < 0 ? "text-[var(--ds-accent)]" : diff > 0 ? "text-red-400" : ""}`} style={diff === 0 ? { color: "var(--ds-text-5)" } : undefined}>
                        {diff < 0 ? `${diffPct}%` : diff > 0 ? `+${diffPct}%` : "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Sub-componente: card de recomendação final ──────── */
function RecommendationCard({ rec, totalCost }: { rec: Recommendation; totalCost: number }) {
  const complexColor = COMPLEXITY_COLOR[rec.migrationComplexity] ?? "#f59e0b";
  const provColor = PROVIDER_COLORS[rec.provider] ?? "var(--ds-accent)";

  return (
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{ borderColor: `${provColor}40`, background: `${provColor}08` }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${provColor}20` }}
          >
            <Trophy size={22} style={{ color: provColor }} />
          </div>
          <div>
            {/* Badge de autoridade CFA + Quave */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border" style={{ background: "var(--ds-hover)", borderColor: "var(--ds-border-md)" }}>
                <Shield size={9} className="text-[var(--ds-accent)]" />
                <span className="text-[9px] font-bold text-[var(--ds-accent)] uppercase tracking-wider">CFA Analysis</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border" style={{ background: "var(--ds-hover)", borderColor: "var(--ds-border-md)" }}>
                <span className="text-[9px]" style={{ color: "var(--ds-text-5)" }}>Quave × Oracle OPN</span>
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: provColor }}>
              Recomendação da Orla
            </p>
            <h3 className="text-xl sm:text-2xl font-black" style={{ color: "var(--ds-text)" }}>{rec.provider}</h3>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-black" style={{ color: provColor }}>
              -{rec.savingPct}%
            </div>
            <div className="text-[10px]" style={{ color: "var(--ds-text-5)" }}>economia</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-black" style={{ color: "var(--ds-text)" }}>{moeda(rec.estimatedCost)}</div>
            <div className="text-[10px]" style={{ color: "var(--ds-text-5)" }}>custo est.</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-black text-[var(--ds-accent)]">{moeda(totalCost - rec.estimatedCost)}</div>
            <div className="text-[10px]" style={{ color: "var(--ds-text-5)" }}>poupado/mês</div>
          </div>
        </div>
      </div>

      {/* Complexidade */}
      <div className="flex items-center gap-2 mb-4">
        <Zap size={13} style={{ color: complexColor }} />
        <span className="text-xs" style={{ color: "var(--ds-text-3)" }}>Complexidade de migração:</span>
        <span className="text-xs font-bold" style={{ color: complexColor }}>{rec.migrationComplexity}</span>
      </div>

      {/* Motivos */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--ds-text-5)" }}>Por que migrar?</p>
        <ul className="space-y-2">
          {rec.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: "var(--ds-muted)" }}>
              <CheckCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: provColor }} />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Serviços que mais economizam */}
      {rec.topServices?.length > 0 && (
        <div className="pt-4 border-t" style={{ borderColor: "var(--ds-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "var(--ds-text-5)" }}>
            Serviços com maior potencial de economia
          </p>
          <div className="flex flex-wrap gap-2">
            {rec.topServices.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border"
                style={{ color: provColor, borderColor: `${provColor}30`, background: `${provColor}10` }}
              >
                <ArrowRight size={10} />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Justificativa CFA */}
      {rec.caf_justification && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--ds-border)" }}>
          <div className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ background: "var(--ds-hover)", borderColor: "var(--ds-border)" }}>
            <Shield size={13} className="text-[var(--ds-accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-[var(--ds-accent)] uppercase tracking-widest mb-1">
                Análise CFA — TransformCloud Intelligence
              </p>
              <p className="text-xs leading-relaxed italic" style={{ color: "var(--ds-text-2)" }}>
                &ldquo;{rec.caf_justification}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-componente: free tiers ──────────────────────── */
function FreeTierSection({ items }: { items: FreeTierOpportunity[] }) {
  const eligible = items.filter((i) => i.eligible);
  const others   = items.filter((i) => !i.eligible);
  const totalSaving = eligible.reduce((s, i) => s + i.monthlySaving, 0);

  return (
    <div className="border rounded-2xl p-4 sm:p-6" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Gift size={15} className="text-[var(--ds-accent)]" />
          <h3 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>Free Tiers Disponíveis</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "var(--ds-text-5)", background: "var(--ds-hover)" }}>
            Dinheiro deixado na mesa
          </span>
        </div>
        {totalSaving > 0 && (
          <div className="text-right">
            <div className="text-lg font-black text-[var(--ds-accent)]">{moeda(totalSaving)}/mês</div>
            <div className="text-[10px]" style={{ color: "var(--ds-text-5)" }}>economia potencial elegível</div>
          </div>
        )}
      </div>

      {/* Elegíveis */}
      {eligible.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {eligible.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#b3fe71]/5 border border-[#b3fe71]/15"
            >
              <div className="w-7 h-7 rounded-lg bg-[#b3fe71]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={13} className="text-[var(--ds-accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold" style={{ color: "var(--ds-text)" }}>{item.provider}</span>
                  <span className="text-[10px]" style={{ color: "var(--ds-text-5)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--ds-text-2)" }}>{item.service}</span>
                  <span className="ml-auto text-xs font-black text-[var(--ds-accent)]">
                    {moeda(item.monthlySaving)}/mês
                  </span>
                </div>
                <p className="text-[11px] leading-snug" style={{ color: "var(--ds-text-3)" }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Não elegíveis (colapsado visualmente) */}
      {others.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--ds-text-4)" }}>
            Outros free tiers — fora do perfil atual
          </p>
          {others.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl border opacity-60"
              style={{ background: "var(--ds-hover)", borderColor: "var(--ds-border-sub)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "var(--ds-hover)" }}>
                <Gift size={12} style={{ color: "var(--ds-text-5)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: "var(--ds-text-3)" }}>{item.provider}</span>
                  <span className="text-[10px]" style={{ color: "var(--ds-text-4)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--ds-text-5)" }}>{item.service}</span>
                </div>
                <p className="text-[11px] leading-snug" style={{ color: "var(--ds-text-5)" }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Orla Loading ──────────────────────────────────── */
const ORLA_STEPS = [
  "Lendo estrutura do arquivo…",
  "Identificando o provedor cloud…",
  "Extraindo custos por serviço…",
  "Calculando totais e tendências…",
  "Mapeando free tiers disponíveis…",
  "Comparando com AWS, GCP, Azure e OCI…",
  "Avaliando complexidade de migração…",
  "Gerando análise CFA da Orla…",
];

function OrlaLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % ORLA_STEPS.length), 1600);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(((step + 1) / ORLA_STEPS.length) * 100);

  return (
    <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#b3fe71]/20" style={{ background: "var(--ds-empty-bg)" }}>
      {/* Glow radial */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] rounded-full bg-[#b3fe71]/6 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-6 sm:px-10 py-8 sm:py-10">

        {/* Mascote polvo com rings */}
        <div className="relative flex-shrink-0">
          {/* Rings de radar */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-28 h-28 rounded-full border border-[#b3fe71]/12 animate-ping" style={{ animationDuration: "2s" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-36 rounded-full border border-[#b3fe71]/7 animate-ping" style={{ animationDuration: "2.8s", animationDelay: "0.5s" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-44 rounded-full border border-[#b3fe71]/4 animate-ping" style={{ animationDuration: "3.6s", animationDelay: "1s" }} />
          </div>
          {/* Polvo */}
          <OrlaMascot size={100} animated mood="thinking" />
        </div>

        {/* Lado direito — textos e progresso */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-lg font-black mb-0.5" style={{ color: "var(--ds-text)" }}>Orla está analisando</p>
          <p className="text-xs mb-5" style={{ color: "var(--ds-text-5)" }}>
            Análise com padrão CFA · Quave × Oracle Cloud
          </p>

          {/* Etapa atual com fade */}
          <div className="h-5 mb-4 overflow-hidden">
            <p
              key={step}
              className="text-sm text-[var(--ds-accent)] font-medium"
              style={{ animation: "fadeUp 0.4s ease forwards" }}
            >
              {ORLA_STEPS[step]}
            </p>
          </div>

          {/* Barra de progresso determinada */}
          <div className="w-full max-w-xs mx-auto sm:mx-0 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px]" style={{ color: "var(--ds-text-4)" }}>Progresso</span>
              <span className="text-[10px] font-bold text-[var(--ds-accent)]">{pct}%</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--ds-hover)" }}>
              <div
                className="h-full rounded-full bg-[#b3fe71] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Dots */}
          <div className="flex gap-1.5 justify-center sm:justify-start">
            {ORLA_STEPS.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === step ? "14px" : "5px",
                  height: "5px",
                  background: i === step
                    ? "var(--ds-accent)"
                    : i < step
                    ? "rgba(132,204,22,0.45)"
                    : "rgba(255,255,255,0.07)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [data, setData]       = useState<BillingData | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  function handleFileSelect(f: File) {
    setError(""); setData(null);
    if (f.size > MAX_FILE_BYTES) {
      setError(`Arquivo muito grande (${(f.size / 1024).toFixed(0)} KB). Máximo: 400 KB.`);
      return;
    }
    const extOk  = /\.(csv|json|txt|tsv)$/i.test(f.name);
    const mimeOk = ["text/csv","application/json","text/plain","application/vnd.ms-excel"].includes(f.type);
    if (!extOk && !mimeOk) { setError("Formato não suportado. Envie CSV, JSON ou TXT."); return; }
    setFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }

  function clearFile() {
    setFile(null); setData(null); setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analisar() {
    if (!file) { setError("Selecione um arquivo primeiro."); return; }
    setLoading(true); setError(""); setData(null);
    try {
      const content = await file.text();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, filename: file.name }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao analisar o arquivo."); return; }
      setData(json as BillingData);
    } catch {
      setError("Erro de rede. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Derivações ─────────────────────────────────── */
  const servicos  = data ? (showAll ? data.services : data.services.slice(0, 6)) : [];
  const bestAlt   = data?.crossCloud.find((r) =>
    !r.isCurrentProvider && r.savingPct > 0 &&
    r.savingPct === Math.max(...(data.crossCloud.filter((x) => !x.isCurrentProvider && x.savingPct > 0).map((x) => x.savingPct)))
  );
  const crossData = data?.crossCloud.map((r) => ({
    ...r,
    fill: PROVIDER_COLORS[r.provider] ?? "#666",
    fillOpacity: r.isCurrentProvider ? 0.35 : r.provider === bestAlt?.provider ? 1 : 0.5,
  })) ?? [];

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-6 sm:mb-8 flex items-center gap-4">
        <OrlaMascot size={56} mood="idle" />
        <div>
          <h1 className="text-xl sm:text-2xl font-black mb-0.5" style={{ color: "var(--ds-text)" }}>
            Orla — Cloud Intelligence
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: "var(--ds-text-5)" }}>
            Análise com padrão CFA · Quave × Oracle Cloud · Zero lock-in
          </p>
        </div>
      </div>

      {/* ── UPLOAD ─────────────────────────────────── */}
      <div className="border rounded-2xl p-4 sm:p-6 mb-5" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Upload size={15} className="text-[var(--ds-accent)]" />
          <h2 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>Arquivo de Billing</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "var(--ds-text-5)", background: "var(--ds-hover)" }}>
            CSV · JSON · TXT · max 400 KB
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {["AWS Cost & Usage Report", "GCP Billing Export", "Azure Cost Analysis", "OCI Cost Report"].map((f) => (
            <span key={f} className="text-[11px] px-2 py-0.5 rounded-md" style={{ color: "var(--ds-text-5)", background: "var(--ds-hover)" }}>{f}</span>
          ))}
        </div>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? "border-[#b3fe71] bg-[#b3fe71]/5" : ""
            }`}
            style={!dragOver ? { borderColor: "var(--ds-border-md)" } : undefined}
          >
            <Upload size={26} className="mx-auto mb-3" style={{ color: "var(--ds-text-4)" }} />
            <p className="text-sm mb-1" style={{ color: "var(--ds-text-3)" }}>
              <span className="text-[var(--ds-accent)] font-semibold">Clique para selecionar</span> ou arraste aqui
            </p>
            <p className="text-xs" style={{ color: "var(--ds-text-4)" }}>CSV, JSON ou TXT — máx. 400 KB</p>
            <input ref={inputRef} type="file" accept=".csv,.json,.txt,.tsv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-[#b3fe71]/5 border border-[#b3fe71]/20 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-[#b3fe71]/15 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-[var(--ds-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--ds-text)" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "var(--ds-text-5)" }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={clearFile} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--ds-text-5)" }}>
              <X size={14} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/8 border border-red-400/15 rounded-xl px-3 py-3 mt-3">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={analisar}
          disabled={loading || !file}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#b3fe71] text-black font-bold text-sm rounded-xl hover:bg-[#65a30d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "Orla está analisando…" : "Analisar com Orla"}
        </button>
      </div>

      {/* ── LOADING ─────────────────────────────────── */}
      {loading && <OrlaLoading />}

      {/* ── RESULTADOS ──────────────────────────────── */}
      {data && !loading && (
        <div className="space-y-4 sm:space-y-5">

          {/* Resumo */}
          {data.summary && (
            <div className="bg-[#b3fe71]/5 border border-[#b3fe71]/20 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <OrlaMascot size={44} mood="happy" className="flex-shrink-0 -mt-1" />
                <div>
                  <p className="text-[10px] text-[var(--ds-accent)] font-bold uppercase tracking-widest mb-1">Resumo — Orla</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ds-muted)" }}>{data.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cards KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: DollarSign, label: "Custo Total", highlight: false,
                value: moeda(data.totalCost),
                sub: `${fmtData(data.period.start)} – ${fmtData(data.period.end)}` },
              { icon: Server, label: "Provedor Atual", highlight: false,
                value: data.provider,
                sub: `${data.services.length} serviços` },
              { icon: TrendingDown, label: "Melhor Alternativa", highlight: true,
                value: bestAlt ? `-${bestAlt.savingPct}%` : "—",
                sub: bestAlt?.provider ?? "sem dados" },
              { icon: DollarSign, label: "Economia Potencial", highlight: true,
                value: bestAlt ? moeda(data.totalCost - bestAlt.estimatedCost) : "—",
                sub: "por mês" },
            ].map((card) => (
              <div key={card.label} className="border rounded-2xl p-4 sm:p-5" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <card.icon size={12} className="text-[var(--ds-accent)] flex-shrink-0" />
                  <span className="text-[10px] truncate" style={{ color: "var(--ds-text-5)" }}>{card.label}</span>
                </div>
                <div className={`text-lg sm:text-2xl font-black truncate ${card.highlight ? "text-[var(--ds-accent)]" : ""}`} style={!card.highlight ? { color: "var(--ds-text)" } : undefined}>
                  {card.value}
                </div>
                <div className="text-[10px] mt-1 truncate" style={{ color: "var(--ds-text-4)" }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Evolução diária */}
          {data.dailyTotals?.length > 0 && (
            <div className="border rounded-2xl p-4 sm:p-6" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
              <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--ds-text)" }}>Evolução de Custos</h3>
              <p className="text-xs mb-4" style={{ color: "var(--ds-text-5)" }}>Período analisado (USD)</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.dailyTotals} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ds-accent)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--ds-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-grid)" />
                  <XAxis dataKey="date" tickFormatter={fmtData} tick={{ fill: "var(--ds-text-5)", fontSize: 10 }}
                    axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "var(--ds-text-5)", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v}`} width={45} />
                  <Tooltip
                    contentStyle={{ background: "var(--ds-tooltip-bg)", border: "1px solid var(--ds-border)", borderRadius: "10px", color: "var(--ds-text)", fontSize: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [moeda(Number(v)), "Custo"]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={(d: any) => fmtData(String(d))}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--ds-accent)" strokeWidth={2} fill="url(#gradTC)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Comparação cross-cloud (gráfico) */}
          {crossData.length > 0 && (
            <div className="border rounded-2xl p-4 sm:p-6" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
              <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--ds-text)" }}>Comparação Cross-Cloud</h3>
              <p className="text-xs mb-4" style={{ color: "var(--ds-text-5)" }}>
                Custo estimado da mesma infraestrutura em outros provedores
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={crossData} barSize={38} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-grid)" />
                  <XAxis dataKey="provider" tick={{ fill: "var(--ds-text-5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--ds-text-5)", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v}`} width={45} />
                  <Tooltip
                    contentStyle={{ background: "var(--ds-tooltip-bg)", border: "1px solid var(--ds-border)", borderRadius: "10px", color: "var(--ds-text)", fontSize: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [moeda(Number(v)), "Custo Est."]}
                  />
                  <Bar dataKey="estimatedCost" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-3">
                {crossData.map((p) => (
                  <div key={p.provider} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill }} />
                    <span style={{ color: "var(--ds-text-3)" }}>{p.provider}</span>
                    {p.isCurrentProvider && <span className="text-[10px]" style={{ color: "var(--ds-text-4)" }}>(atual)</span>}
                    {!p.isCurrentProvider && p.savingPct > 0 && (
                      <span className="font-bold text-[var(--ds-accent)]">-{p.savingPct}%</span>
                    )}
                    {!p.isCurrentProvider && p.savingPct < 0 && (
                      <span className="font-bold text-red-400">+{Math.abs(p.savingPct)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COMPARATIVO DE SERVIÇOS (NOVO) ──────── */}
          {data.serviceComparison?.length > 0 && (
            <div className="border rounded-2xl p-4 sm:p-6" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
              <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--ds-text)" }}>Comparativo de Serviços por Provedor</h3>
              <p className="text-xs mb-4" style={{ color: "var(--ds-text-5)" }}>
                Custo estimado de cada serviço nos 4 provedores — verde = melhor opção
              </p>
              <ServiceComparisonTable
                rows={data.serviceComparison}
                currentProvider={data.provider}
              />
            </div>
          )}

          {/* Breakdown por serviço */}
          {servicos.length > 0 && (
            <div className="border rounded-2xl p-4 sm:p-6" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
              <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--ds-text)" }}>Breakdown por Serviço</h3>
              <p className="text-xs mb-4" style={{ color: "var(--ds-text-5)" }}>Distribuição de custos no período</p>
              <div className="space-y-3">
                {servicos.map((s, i) => {
                  const cor = SERVICE_COLORS[i % SERVICE_COLORS.length];
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: cor }} />
                          <span className="text-xs sm:text-sm truncate" style={{ color: "var(--ds-muted)" }}>{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px]" style={{ color: "var(--ds-text-4)" }}>{s.percentage.toFixed(1)}%</span>
                          <span className="text-xs sm:text-sm font-bold" style={{ color: "var(--ds-text)" }}>{moeda(s.cost)}</span>
                        </div>
                      </div>
                      <div className="w-full rounded-full h-1.5" style={{ background: "var(--ds-bar-bg)" }}>
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${s.percentage}%`, background: cor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.services.length > 6 && (
                <button onClick={() => setShowAll(!showAll)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-[var(--ds-accent)] hover:underline">
                  {showAll
                    ? <><ChevronUp size={12} /> Ver menos</>
                    : <><ChevronDown size={12} /> Ver todos os {data.services.length} serviços</>}
                </button>
              )}
            </div>
          )}

          {/* ── FREE TIERS ──────────────────────────── */}
          {data.freeTierOpportunities && data.freeTierOpportunities.length > 0 && (
            <FreeTierSection items={data.freeTierOpportunities} />
          )}

          {/* ── RECOMENDAÇÃO FINAL ───────────────────── */}
          {data.recommendation && (
            <RecommendationCard rec={data.recommendation} totalCost={data.totalCost} />
          )}

          {/* Insights */}
          {data.insights?.length > 0 && (
            <div className="border rounded-2xl p-4 sm:p-6" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-[var(--ds-accent)]" />
                <h3 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>Insights da Orla</h3>
              </div>
              <ul className="space-y-3">
                {data.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: "var(--ds-text-2)" }}>
                    <span className="w-5 h-5 rounded-full bg-[#b3fe71]/10 text-[var(--ds-accent)] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {!data && !loading && (
        <div className="border border-dashed rounded-2xl p-10 sm:p-14 text-center" style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}>
          <div className="flex justify-center mb-3">
            <OrlaMascot size={90} mood="idle" />
          </div>
          <h3 className="font-bold mb-2 text-sm sm:text-base" style={{ color: "var(--ds-text)" }}>
            Olá, sou a Orla.
          </h3>
          <p className="text-xs sm:text-sm max-w-sm mx-auto leading-relaxed" style={{ color: "var(--ds-text-5)" }}>
            Envie seu arquivo de billing e eu analiso seus custos, comparo os 4 grandes provedores,
            mapeio free tiers e gero uma recomendação com padrão CFA — em minutos.
          </p>
          <p className="mt-3 text-[10px]" style={{ color: "var(--ds-text-4)" }}>
            AWS Cost Explorer · GCP Billing · Azure Cost Analysis · OCI Cost Report
          </p>
        </div>
      )}
    </div>
  );
}
