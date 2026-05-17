"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import OrlaMascot from "@/app/components/OrlaMascot";

const MAX_PUPIL = 2.4;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function WatchingOrla() {
  const ref = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // normalise e limita ao raio máximo
      const scale = Math.min(dist, 120) / 120;
      setPupil({
        x: clamp((dx / dist) * MAX_PUPIL * scale, -MAX_PUPIL, MAX_PUPIL),
        y: clamp((dy / dist) * MAX_PUPIL * scale, -MAX_PUPIL, MAX_PUPIL),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute bottom-8 right-8 pointer-events-none select-none"
      style={{
        zIndex: 5,
        filter: "drop-shadow(0 0 24px rgba(179,254,113,0.3))",
      }}
    >
      <OrlaMascot size={140} mood="default" animated pupilOffset={pupil} />
    </div>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      sectionRef.current.style.setProperty("--tx", `${dx * -8}deg`);
      sectionRef.current.style.setProperty("--ty", `${dy * 8}deg`);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-20 pb-28 overflow-hidden"
      style={{ perspective: "1200px" } as React.CSSProperties}
    >
      <div className="hero-glow" />
      <div
        className="absolute inset-0 grid-bg opacity-[0.3]"
        style={{
          transform: "rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg)) translateZ(20px)",
          transition: "transform 0.4s ease-out",
        }}
      />

      <WatchingOrla />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">

          <h1 className="animate-fade-up delay-1 text-[clamp(2.6rem,7.5vw,5.5rem)] font-black leading-[1.02] tracking-tight">
            Pare de pagar mais do que
            <span className="block text-[#b3fe71]">sua cloud vale.</span>
          </h1>

          <p className="animate-fade-up delay-2 text-[clamp(1rem,2vw,1.2rem)] text-[#a3a3a3] max-w-2xl leading-relaxed">
            72% das empresas estouraram o budget de cloud.
            O <strong className="text-white">Orla</strong> analisa seu billing, compara os 4 grandes provedores
            e entrega um plano de migração com ROI calculado — em minutos.
          </p>

          <div className="animate-fade-up delay-4 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link href="/dashboard" className="btn-primary w-full sm:w-auto text-base">
              Analisar minha cloud agora
              <ArrowRight size={16} />
            </Link>
            <a href="#modulos" className="btn-secondary w-full sm:w-auto text-base">
              Ver como funciona
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
