"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 72,
    suffix: "%",
    score: 72,
    label: "das empresas estouram o budget de cloud",
    insight: "Sem governanca de custos, crescimento vira passivo financeiro.",
    decimals: 0,
  },
  {
    value: 32,
    suffix: "%",
    score: 32,
    label: "do orcamento e desperdicado em media",
    insight: "Recursos ociosos reduzem margem sem gerar valor para o negocio.",
    decimals: 0,
  },
  {
    value: 44.5,
    suffix: "B",
    prefix: "US$",
    score: 89,
    label: "desperdicados globalmente em recursos ociosos",
    insight: "A ineficiencia e global, otimizar cedo vira vantagem competitiva.",
    decimals: 1,
  },
  {
    value: 46,
    suffix: "%",
    score: 46,
    label: "de crescimento na adocao de FinOps",
    insight: "Empresas maduras tratam custo cloud como estrategia, nao suporte.",
    decimals: 0,
  },
];

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState<number[]>(() => stats.map(() => 0));

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let start: number;
    const duration = 1800;
    let raf = 0;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValues(
        stats.map((s) => parseFloat((eased * s.value).toFixed(s.decimals)))
      );

      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-white/5 bg-[#090909] pt-20 pb-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -6%, rgba(132,204,22,0.16) 0%, rgba(132,204,22,0.03) 42%, transparent 75%), linear-gradient(to bottom, rgba(255,255,255,0.03), transparent 30%)",
        }}
      />

      <div className="section-container relative z-10 max-w-[1320px]">
        <div className="mx-auto mb-12 flex max-w-[760px] flex-col items-center text-center sm:mb-14">
          
          <h2 className="mb-4 text-[clamp(2rem,4.7vw,3.2rem)] font-black leading-tight tracking-tight text-white">
            Entenda onde o custo cloud
            <span className="text-[#b3fe71]"> esta escapando.</span>
          </h2>
          <p className="max-w-[64ch] text-sm leading-relaxed text-[#a3a3a3] sm:text-base">
            Estes indicadores mostram o tamanho do desperdicio, o risco financeiro e o potencial de ganho para orientar sua proxima decisao com clareza.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1180px] auto-rows-fr grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:gap-7 xl:grid-cols-4">
          {stats.map((s, i) => {
            const fill = Math.min(s.score, 100);
            const current = values[i] ?? 0;

            return (
              <div
                key={i}
                className="group  w-full max-w-[340px]"
                style={{
                  animationName: visible ? "fadeUp" : "none",
                  animationDuration: "0.65s",
                  animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                  animationFillMode: "forwards",
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div
                  className="relative h-full min-h-[250px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#131313]/95 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-[#b3fe71]/55 group-hover:shadow-[0_18px_46px_rgba(0,0,0,0.42)] sm:min-h-[265px]"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)" }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 50% -10%, rgba(132,204,22,0.26) 0%, rgba(132,204,22,0.04) 42%, transparent 76%)",
                    }}
                  />

                  <div className="relative z-10 flex h-full flex-col items-center justify-between p-6 text-center sm:p-7">
                    <div className="w-full">
                      <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-[#b3fe71]/70 to-transparent" />

                      <div className="mb-3 text-[clamp(2.2rem,5vw,3.25rem)] font-black leading-none tracking-tight text-[#9eea21] drop-shadow-[0_0_18px_rgba(132,204,22,0.2)] tabular-nums">
                        {s.prefix ?? ""}
                        {current.toFixed(s.decimals)}
                        {s.suffix}
                      </div>

                      <p className="mx-auto mb-2 max-w-[24ch] text-base font-semibold leading-snug text-white sm:text-[15px]">
                        {s.label}
                      </p>

                      <p className="mx-auto max-w-[31ch] text-xs leading-relaxed text-[#8a8a8a] sm:text-[13px]">
                        {s.insight}
                      </p>
                    </div>

                    <div className="w-full pt-4">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f6f6f]">
                        <span>Indice de atencao</span>
                        <span className="text-[#a8a8a8]">{Math.round(fill)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#6ea612] to-[#9eea21] transition-[width] duration-700"
                          style={{ width: `${fill}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-[680px] text-center text-xs leading-relaxed text-[#6f6f6f] sm:mt-10 sm:text-sm">
          Benchmark de mercado para diagnostico inicial. A analise personalizada considera uso real, arquitetura e perfil de carga.
        </p>
      </div>
    </section>
  );
}
