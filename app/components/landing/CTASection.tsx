import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section-spacing">
      <div className="section-container">
        <div className="relative overflow-hidden rounded-3xl bg-[#161616] border border-white/8 px-6 sm:px-12 lg:px-20 py-16 sm:py-24 lg:py-28 text-center">

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#b3fe71]/8 rounded-full blur-[80px]" />
          </div>
          <div className="absolute inset-0 grid-bg opacity-20 rounded-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">

            {/* Badge autoridade */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#a3a3a3] mb-8">
              <Shield size={11} className="text-[#b3fe71]" />
              Análise com rigor CFA ·
            </div>

            <h2 className="text-[clamp(2rem,5.5vw,3.5rem)] font-black tracking-tight leading-[1.05] mb-6">
              Seu CFO vai agradecer.
              <span className="block text-[#b3fe71]">Sua equipe, também.</span>
            </h2>

            {/* Tom Mario Perino — direto e orientado a ROI */}
            <p className="text-[#a3a3a3] text-base sm:text-lg leading-relaxed mb-10">
              A maioria das empresas descobre que desperdiça entre 30% e 40% do budget de cloud
              só depois que o prejuízo já aconteceu. A Orla mostra isso <em className="text-white not-italic font-semibold">antes</em> — com dados,
              não com chute.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link href="/dashboard" className="btn-primary w-full sm:w-auto text-base">
                Analisar minha cloud agora
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#444]">
              <span>Sem cartão de crédito</span>
              <span className="text-[#2a2a2a]">·</span>
              <span>Acesso somente leitura</span>
              <span className="text-[#2a2a2a]">·</span>
              <span>LGPD compliant</span>
              <span className="text-[#2a2a2a]">·</span>
              <span>Análise padrão CFA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}