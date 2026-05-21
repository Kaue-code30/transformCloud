"use client";
import React from "react";

const KEYFRAMES = `
  @keyframes tc-spin    { to { transform: rotate(360deg); } }
  @keyframes tc-spin-r  { to { transform: rotate(-360deg); } }
  @keyframes tc-pulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.55} }
  @keyframes tc-ping    { 0%{transform:scale(0.3);opacity:0.7} 100%{transform:scale(4);opacity:0} }
  @keyframes tc-drift   { 0%,100%{transform:translateY(0px) translateX(0px)} 33%{transform:translateY(-9px) translateX(4px)} 66%{transform:translateY(5px) translateX(-3px)} }
  @keyframes tc-scan    { 0%{top:-4%;opacity:0} 10%{opacity:0.7} 90%{opacity:0.7} 100%{top:104%;opacity:0} }
`;

// Partículas distribuídas na tela — posições fixas para evitar problemas de SSR
const PARTICLES = [
  { l: '7%',  t: '10%', s: 3, d: '0s',   dur: '4.2s', op: 0.35 },
  { l: '21%', t: '5%',  s: 2, d: '0.8s', dur: '5.1s', op: 0.22 },
  { l: '38%', t: '17%', s: 4, d: '1.5s', dur: '3.9s', op: 0.40 },
  { l: '54%', t: '7%',  s: 2, d: '0.3s', dur: '4.7s', op: 0.20 },
  { l: '70%', t: '13%', s: 3, d: '2.1s', dur: '5.3s', op: 0.28 },
  { l: '84%', t: '21%', s: 2, d: '1.0s', dur: '4.1s', op: 0.22 },
  { l: '91%', t: '44%', s: 3, d: '1.6s', dur: '3.6s', op: 0.32 },
  { l: '87%', t: '68%', s: 2, d: '0.5s', dur: '4.9s', op: 0.18 },
  { l: '77%', t: '84%', s: 4, d: '2.4s', dur: '5.0s', op: 0.38 },
  { l: '59%', t: '91%', s: 2, d: '1.2s', dur: '3.8s', op: 0.22 },
  { l: '41%', t: '87%', s: 3, d: '1.9s', dur: '4.5s', op: 0.28 },
  { l: '24%', t: '81%', s: 2, d: '0.6s', dur: '5.2s', op: 0.18 },
  { l: '9%',  t: '71%', s: 4, d: '2.6s', dur: '3.7s', op: 0.40 },
  { l: '4%',  t: '49%', s: 2, d: '1.3s', dur: '4.2s', op: 0.22 },
  { l: '14%', t: '34%', s: 3, d: '0.9s', dur: '5.4s', op: 0.30 },
  { l: '29%', t: '41%', s: 2, d: '2.0s', dur: '4.8s', op: 0.18 },
  { l: '64%', t: '37%', s: 3, d: '1.4s', dur: '3.5s', op: 0.26 },
  { l: '74%', t: '54%', s: 4, d: '0.4s', dur: '4.6s', op: 0.36 },
  { l: '47%', t: '59%', s: 2, d: '2.3s', dur: '5.5s', op: 0.20 },
  { l: '19%', t: '57%', s: 3, d: '1.1s', dur: '4.3s', op: 0.28 },
];

function dot(size: number, pos: React.CSSProperties): React.CSSProperties {
  return {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    background: '#b3fe71',
    boxShadow: `0 0 ${size + 6}px #b3fe71, 0 0 ${size * 3}px rgba(179,254,113,0.4)`,
    ...pos,
  };
}

export function AuthIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{KEYFRAMES}</style>

      {/* Linha de scan horizontal */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(179,254,113,0.6) 30%, rgba(179,254,113,0.9) 50%, rgba(179,254,113,0.6) 70%, transparent 100%)',
        animation: 'tc-scan 8s ease-in-out 1.5s infinite',
        pointerEvents: 'none',
      }} />

      {/* Partículas flutuantes */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.l, top: p.t,
          width: p.s, height: p.s,
          borderRadius: '50%',
          background: '#b3fe71',
          opacity: p.op,
          animation: `tc-drift ${p.dur} ease-in-out ${p.d} infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Sistema orbital — centralizado */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300, height: 300,
      }}>

        {/* Anel 3 — mais externo, mais lento (28s) */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(179,254,113,0.07)',
          animation: 'tc-spin 28s linear infinite',
        }}>
          <div style={dot(10, { top: -5, left: '50%', marginLeft: -5 })} />
          <div style={dot(6,  { bottom: -3, left: '50%', marginLeft: -3, opacity: 0.35 })} />
        </div>

        {/* Anel 2 — médio, invertido (17s), 3 orbs */}
        <div style={{
          position: 'absolute', inset: 42,
          borderRadius: '50%',
          border: '1px solid rgba(179,254,113,0.11)',
          animation: 'tc-spin-r 17s linear infinite',
        }}>
          {/* Orb no 0° (topo) */}
          <div style={dot(12, { top: -6, left: '50%', marginLeft: -6 })} />
          {/* Orb no 120° */}
          <div style={{ position: 'absolute', inset: 0, transform: 'rotate(120deg)' }}>
            <div style={dot(7, { top: -3, left: '50%', marginLeft: -3, opacity: 0.45 })} />
          </div>
          {/* Orb no 240° */}
          <div style={{ position: 'absolute', inset: 0, transform: 'rotate(240deg)' }}>
            <div style={dot(5, { top: -2, left: '50%', marginLeft: -2, opacity: 0.28 })} />
          </div>
        </div>

        {/* Anel 1 — mais interno, mais rápido (9s) */}
        <div style={{
          position: 'absolute', inset: 90,
          borderRadius: '50%',
          border: '1px solid rgba(179,254,113,0.18)',
          animation: 'tc-spin 9s linear infinite',
        }}>
          <div style={dot(9, { top: -4, left: '50%', marginLeft: -4 })} />
          <div style={dot(5, { bottom: -2, left: '50%', marginLeft: -2, opacity: 0.38 })} />
        </div>

        {/* Núcleo central */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          {/* Anéis de ping */}
          {[
            { delay: '0s',   opacity: 0.65 },
            { delay: '1s',   opacity: 0.45 },
            { delay: '2s',   opacity: 0.28 },
          ].map(({ delay, opacity }, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 54, height: 54,
              marginTop: -27, marginLeft: -27,
              borderRadius: '50%',
              border: `1px solid rgba(179,254,113,${opacity})`,
              animation: `tc-ping 3s ease-out ${delay} infinite`,
            }} />
          ))}
          {/* Orb central */}
          <div style={{
            width: 22, height: 22,
            borderRadius: '50%',
            background: '#b3fe71',
            boxShadow: '0 0 20px #b3fe71, 0 0 45px rgba(179,254,113,0.55), 0 0 90px rgba(179,254,113,0.2)',
            animation: 'tc-pulse 3.5s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
