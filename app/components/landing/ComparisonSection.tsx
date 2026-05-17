"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

const providers = ["AWS", "GCP", "Azure", "OCI"];
const costs: Record<string, Record<string, { cost: number; saving: number; color: string }>> = {
  AWS: {
    AWS:   { cost: 10000, saving: 0,    color: "#f97316" },
    GCP:   { cost: 8800,  saving: 12,   color: "#3b82f6" },
    Azure: { cost: 9200,  saving: 8,    color: "#06b6d4" },
    OCI:   { cost: 6000,  saving: 40,   color: "#b3fe71" },
  },
  GCP: {
    AWS:   { cost: 10800, saving: -8,   color: "#f97316" },
    GCP:   { cost: 10000, saving: 0,    color: "#3b82f6" },
    Azure: { cost: 9700,  saving: 3,    color: "#06b6d4" },
    OCI:   { cost: 6500,  saving: 35,   color: "#b3fe71" },
  },
  Azure: {
    AWS:   { cost: 10400, saving: -4,   color: "#f97316" },
    GCP:   { cost: 8200,  saving: 18,   color: "#3b82f6" },
    Azure: { cost: 10000, saving: 0,    color: "#06b6d4" },
    OCI:   { cost: 6200,  saving: 38,   color: "#b3fe71" },
  },
  OCI: {
    AWS:   { cost: 11000, saving: -10,  color: "#f97316" },
    GCP:   { cost: 9500,  saving: 5,    color: "#3b82f6" },
    Azure: { cost: 10200, saving: -2,   color: "#06b6d4" },
    OCI:   { cost: 10000, saving: 0,    color: "#b3fe71" },
  },
};

function formatCost(n: number) {
  return "$" + n.toLocaleString("pt-BR");
}

export default function ComparisonSection() {
  const [current, setCurrent] = useState("AWS");

  const rows = Object.entries(costs[current]).filter(([p]) => p !== current);
  const bestEntry = rows.reduce<[string, { cost: number; saving: number; color: string }] | null>(
    (a, entry) => (a === null || entry[1].saving > a[1].saving ? entry : a),
    null
  );

  const currentCost = costs[current][current].cost;
  const bestProvider = bestEntry?.[0] ?? "";
  const bestSaving = bestEntry?.[1].saving ?? 0;
  const bestCost = bestEntry?.[1].cost ?? 0;

  return (
    <section className="section-spacing">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mx-auto mb-10 sm:mb-12">
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-black tracking-tight leading-tight mb-4">
            Veja quanto você{" "}
            <span className="text-[#b3fe71]">poderia economizar</span>{" "}
            migrando de provedor.
          </h2>
          <p className="text-[#a3a3a3] text-base sm:text-lg leading-relaxed">
            Selecione seu provedor atual e descubra a economia estimada rodando
            a mesma infraestrutura nos concorrentes.
          </p>
        </div>

        {/* Provider selector */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setCurrent(p)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                current === p
                  ? "bg-[#b3fe71] text-black border-[#b3fe71]"
                  : "bg-transparent text-[#a3a3a3] border-[#2a2a2a] hover:border-[#b3fe71]/50 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* ORLA analysis block */}
        <div className="mb-10 flex justify-center">
          <div className="bg-[#181c1a] border border-[#b3fe71]/30 rounded-xl px-6 py-5 w-full max-w-xl shadow-lg font-mono text-[15px] text-[#b3fe71] leading-relaxed select-text">
            <span className="block text-xs text-[#a3a3a3] mb-2">
              orla@transformcloud:~$ análise rápida
            </span>
            <span>
              Provedor atual:{" "}
              <b className="text-white">{current}</b>
              <br />
              {bestSaving > 0 ? (
                <>
                  Melhor economia:{" "}
                  <b className="text-white">-{bestSaving}%</b> migrando para{" "}
                  <b className="text-white">{bestProvider}</b>
                  <br />
                  Estimativa mensal:{" "}
                  <b className="text-white">{formatCost(bestCost)}</b> vs.{" "}
                  <b className="text-[#a3a3a3] line-through">{formatCost(currentCost)}</b>
                </>
              ) : (
                <>
                  <span className="text-[#f97316]">
                    Nenhuma economia identificada nos provedores alternativos.
                  </span>
                  <br />
                  Custo atual estimado:{" "}
                  <b className="text-white">{formatCost(currentCost)}/mês</b>
                </>
              )}
              <br />
              <span className="text-[#a3a3a3]">
                Recomendações detalhadas disponíveis no dashboard.
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
