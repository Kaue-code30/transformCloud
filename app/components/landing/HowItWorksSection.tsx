"use client";
import { useState } from "react";
import { Link2, BarChart2, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Link2,
    title: "Envie seu billing",
    desc: "Exporte o relatório de custos do seu provedor e faça upload. AWS CUR, GCP Billing Export, Azure Cost Analysis ou OCI Cost Report.",
    detail: [
      "CSV, JSON ou TXT — sem integrações complexas",
      "Seus dados não são armazenados em nenhum momento",
      "Leva menos de 1 minuto para subir o arquivo",
    ],
  },
  {
    icon: BarChart2,
    title: "A Orla analisa tudo",
    desc: "A Orla lê seu billing, identifica os serviços, calcula quanto você pagaria em cada provedor e mapeia os free tiers que você não está usando.",
    detail: [
      "Comparação real entre AWS, GCP, Azure e OCI",
      "Free tiers mapeados — dinheiro deixado na mesa",
      "Score de portabilidade por tipo de serviço",
    ],
  },
  {
    icon: Sparkles,
    title: "Receba o veredicto",
    desc: "Um plano direto: qual provedor migrar, quais serviços priorizar, qual o payback esperado. Com justificativa financeira em padrão CFA.",
    detail: [
      "Recomendação com cálculo de ROI e payback",
      "Complexidade de migração avaliada por serviço",
      "Linguagem para o CFO e para o CTO, ao mesmo tempo",
    ],
  },
];

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="como-funciona" className="section-spacing bg-[#0a0a0a]">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="tag mx-auto mb-5">Como funciona</div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-black tracking-tight leading-tight mb-4">
            Upload. Análise. <span className="text-[#b3fe71]">Decisão.</span>
          </h2>
          <p className="text-[#a3a3a3] text-base sm:text-lg">
            Sem APIs para configurar. Sem semanas de consultoria.
            Sem estimativas no chute. Só dados e clareza.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-14 sm:mb-16">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-left p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${
                active === i
                  ? "border-[#b3fe71]/30 bg-[#b3fe71]/5 shadow-lg shadow-lime-500/5"
                  : "border-white/5 bg-[#161616] hover:border-white/10 hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active === i ? "bg-[#b3fe71] shadow-lg shadow-lime-500/30" : "bg-white/5"}`}>
                  <s.icon size={17} className={active === i ? "text-black" : "text-[#555]"} />
                </div>
                <span className={`text-4xl font-black transition-colors ${active === i ? "text-[#b3fe71]/20" : "text-white/5"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className={`font-bold text-base sm:text-lg mb-2 transition-colors ${active === i ? "text-white" : "text-[#a3a3a3]"}`}>
                {s.title}
              </h3>
              <p className="text-sm text-[#666] leading-relaxed mb-4">{s.desc}</p>

              <ul className={`space-y-2.5 overflow-hidden transition-all duration-300 ${active === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                {s.detail.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={12} className="text-[#b3fe71] flex-shrink-0 mt-0.5" />
                    <span className="text-[#a3a3a3]">{d}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="btn-primary">
            Começar agora — grátis
            <ArrowRight size={16} />
          </Link>
          <p className="mt-3 text-xs text-[#555]">
            Sem cartão de crédito · Dados nunca armazenados · Análise com padrão CFA
          </p>
        </div>
      </div>
    </section>
  );
}