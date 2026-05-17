"use client";
import { useState } from "react";
import { BarChart3, TrendingDown, Shield, Zap, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

const modules = [
  {
    number: "01",
    icon: BarChart3,
    title: "Extração de Billing",
    summary: "Conexão direta com as APIs de billing de AWS, GCP, Azure e OCI.",
    detail:
      "A plataforma extrai, normaliza e interpreta todos os seus custos em tempo real. Suporte a múltiplas contas no mesmo provedor e visão consolidada de todos os provedores simultaneamente. Sem exportações manuais, sem planilhas.",
    tags: ["AWS", "GCP", "Azure", "OCI"],
    color: "#b3fe71",
  },
  {
    number: "02",
    icon: TrendingDown,
    title: "Cotação Cross-Cloud",
    summary: "Mapeamento automático de serviços e estimativa de economia por provedor.",
    detail:
      "Com o billing extraído, a plataforma calcula quanto custaria rodar exatamente a mesma infraestrutura (as-is) em cada um dos outros provedores. Exibe a economia em percentual e em reais para cada cenário de migração.",
    tags: ["De-para", "Preços em tempo real", "Estimativa de economia"],
    color: "#22d3ee",
  },
  {
    number: "03",
    icon: Shield,
    title: "Score de Portabilidade",
    summary: "Análise de dependências proprietárias e viabilidade de migração.",
    detail:
      "Avalia cada serviço em uso: Kubernetes padrão = alta portabilidade. DynamoDB, Lambda, Cloud Run = baixa. Gera um score de 0 a 100 e indica quais workloads valem a pena migrar e quais têm custo-benefício desfavorável.",
    tags: ["Score 0-100", "Análise de lock-in", "Recomendações"],
    color: "#a78bfa",
  },
  {
    number: "04",
    icon: Zap,
    title: "Automação de Migrações",
    summary: "Receitas prontas e reutilizáveis para migrar infra portável.",
    detail:
      "Não são scripts escritos do zero. São receitas padronizadas para tipos comuns de infraestrutura: Kubernetes, VMs, bancos de dados, object storage. Execute com segurança, com validação a cada etapa.",
    tags: ["Kubernetes", "VMs", "Storage", "Databases"],
    color: "#f59e0b",
  },
  {
    number: "05",
    icon: Bot,
    title: "IA de Insights — O Cérebro",
    summary: "Proposta personalizada consolidando todos os módulos com IA.",
    detail:
      "A camada de IA analisa billing, cotações, score de portabilidade e automações disponíveis para gerar uma proposta tailor-made: o que migrar, para onde, quando, e com que nível de esforço. O CFO e o CTO recebem respostas, não dados brutos.",
    tags: ["Tailor-made", "Consolidação", "Decisão inteligente"],
    color: "#f472b6",
  },
];

export default function ModulesSection() {
  const [active, setActive] = useState(0);
  const mod = modules[active];

  return (
    <section id="modulos" className="section-spacing">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mx-auto mb-14 sm:mb-16">
          <div className="tag mx-auto mb-5">5 Módulos</div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-black tracking-tight leading-tight mb-4">
            Um motor completo de{" "}
            <span className="text-[#b3fe71]">inteligência cloud.</span>
          </h2>
          <p className="text-[#a3a3a3] text-base sm:text-lg">
            Cada módulo resolve uma dor específica. Juntos, respondem todas as
            perguntas que seu CFO e CTO fazem todos os dias.
          </p>
        </div>

        {/* Layout interativo */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">

          {/* Lista de módulos */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {modules.map((m, i) => (
              <button
                key={m.number}
                onClick={() => setActive(i)}
                className={`w-full text-left px-4 py-4 rounded-2xl border transition-all duration-200 group ${
                  active === i
                    ? "border-white/10 bg-[#1a1a1a]"
                    : "border-transparent hover:border-white/5 hover:bg-[#161616]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: active === i ? `${m.color}20` : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <m.icon
                      size={16}
                      style={{ color: active === i ? m.color : "#555" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-black"
                        style={{ color: active === i ? m.color : "#444" }}
                      >
                        {m.number}
                      </span>
                      <span
                        className={`text-sm font-bold truncate transition-colors ${
                          active === i ? "text-white" : "text-[#666] group-hover:text-[#a3a3a3]"
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#555] leading-snug mt-0.5 line-clamp-1">
                      {m.summary}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Painel de detalhes */}
          <div
            key={active}
            className="lg:col-span-3 rounded-2xl border border-white/8 bg-[#161616] p-6 sm:p-8"
            style={{ borderColor: `${mod.color}20` }}
          >
            {/* Ícone e número */}
            <div className="flex items-start justify-between mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${mod.color}15` }}
              >
                <mod.icon size={26} style={{ color: mod.color }} />
              </div>
              <span
                className="text-5xl font-black opacity-15 select-none"
                style={{ color: mod.color }}
              >
                {mod.number}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black mb-3">{mod.title}</h3>
            <p className="text-[#a3a3a3] text-sm sm:text-base leading-relaxed mb-6">
              {mod.detail}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-7">
              {mod.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold px-3 py-1 rounded-full border"
                  style={{
                    color: mod.color,
                    background: `${mod.color}10`,
                    borderColor: `${mod.color}25`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link href="/dashboard" className="btn-primary !text-sm !py-2.5 !px-5">
              Experimentar agora
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
