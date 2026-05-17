import { Cloud, Layers, Bot, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Cloud,
    title: "Qualquer Cloud",
    desc: "AWS, GCP, Azure e OCI. Multi-conta e multi-provedor em uma única visão consolidada.",
    tag: "Multi-cloud",
  },
  {
    icon: Layers,
    title: "Zero Lock-in",
    desc: "Score de portabilidade em tempo real. Entenda o quão preso você está e como sair.",
    tag: "Portabilidade",
  },
  {
    icon: Bot,
    title: "IA Integrada",
    desc: "Recomendações personalizadas com IA analisando toda sua infraestrutura e histórico.",
    tag: "Inteligência",
  },
  {
    icon: CheckCircle,
    title: "Dados Reais",
    desc: "Validado com empresas reais com billing acima de US$5k/mês. Não são mockups.",
    tag: "Confiável",
  },
];

export default function PlatformSection() {
  return (
    <section id="plataforma" className="section-spacing bg-[#0a0a0a]">
      <div className="section-container">
        {/* Header */}
        <div className="text-center  mx-auto mb-14 sm:mb-20">
          <div className="tag mx-auto mb-5">A Plataforma</div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-black tracking-tight leading-tight mb-4">
            Qualquer Cloud.{" "}
            <span className="text-[#b3fe71]">Uma Plataforma.</span>
          </h2>
          <p className="text-[#a3a3a3] text-base sm:text-lg leading-relaxed">
            A experiência tipo Vercel para toda a sua infraestrutura. Deploy,
            escala e gestão em qualquer provedor de nuvem, na conta do cliente.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card card-lime p-6 group cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#b3fe71]/10 flex items-center justify-center group-hover:bg-[#b3fe71]/20 transition-colors">
                  <f.icon size={20} className="text-[#b3fe71]" />
                </div>
                <span className="text-[10px] font-semibold text-[#555] bg-white/5 px-2 py-1 rounded-full">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-bold text-[15px] mb-3">{f.title}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-8 sm:py-10 border-t border-b border-white/5">
          {[
            { val: "2000+", label: "apps deployados" },
            { val: "99.99%", label: "uptime garantido" },
            { val: "50%", label: "redução de custos" },
            { val: "15+", label: "anos de mercado" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl sm:text-2xl font-black text-white">{s.val}</div>
              <div className="text-xs text-[#555] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
