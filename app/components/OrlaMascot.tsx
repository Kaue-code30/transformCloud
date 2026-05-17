"use client";
import { useId } from "react";

interface OrlaMascotProps {
  size?: number;
  animated?: boolean;
  className?: string;
  /** "default" | "thinking" | "happy" | "idle" */
  mood?: "default" | "thinking" | "happy" | "idle";
  /** SVG-unit offset for pupils (max ~2.5). Overrides orla-pupil animation. */
  pupilOffset?: { x: number; y: number };
}

export default function OrlaMascot({
  size = 80,
  animated = true,
  className = "",
  mood = "default",
  pupilOffset,
}: OrlaMascotProps) {
  const reactId = useId();
  const id = `orla-${reactId.replace(/:/g, "")}`;

  /* cores */
  const body    = "#b3fe71";
  const bodyDim = "#65a30d";
  const bodyGlow= "rgba(132,204,22,0.35)";
  const dark    = "#0f0f0f";
  const white   = "#ffffff";
  const blush   = "rgba(132,204,22,0.25)";

  const eyeStyle = mood === "happy"
    ? "happy"
    : mood === "thinking"
    ? "thinking"
    : "normal";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Gradiente do corpo */}
        <radialGradient id={`${id}-body`} cx="42%" cy="38%" r="58%">
          <stop offset="0%"   stopColor="#a3e635" />
          <stop offset="60%"  stopColor={body} />
          <stop offset="100%" stopColor={bodyDim} />
        </radialGradient>

        {/* Brilho */}
        <radialGradient id={`${id}-shine`} cx="35%" cy="30%" r="40%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Glow externo */}
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Sombra suave */}
        <filter id={`${id}-shadow`} x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={bodyGlow} />
        </filter>

        {/* Animações */}
        <style>{`
          @keyframes orla-float {
            0%,100% { transform: translateY(0px); }
            50%      { transform: translateY(-5px); }
          }
          @keyframes orla-tentacle-l1 {
            0%,100% { transform-origin: top center; transform: rotate(-8deg); }
            50%      { transform-origin: top center; transform: rotate(4deg); }
          }
          @keyframes orla-tentacle-l2 {
            0%,100% { transform-origin: top center; transform: rotate(-5deg); }
            50%      { transform-origin: top center; transform: rotate(6deg); }
          }
          @keyframes orla-tentacle-r1 {
            0%,100% { transform-origin: top center; transform: rotate(8deg); }
            50%      { transform-origin: top center; transform: rotate(-4deg); }
          }
          @keyframes orla-tentacle-r2 {
            0%,100% { transform-origin: top center; transform: rotate(5deg); }
            50%      { transform-origin: top center; transform: rotate(-6deg); }
          }
          @keyframes orla-tentacle-c {
            0%,100% { transform-origin: top center; transform: scaleX(1); }
            50%      { transform-origin: top center; transform: scaleX(0.92); }
          }
          @keyframes orla-blink {
            0%,90%,100% { transform: scaleY(1); }
            95%          { transform: scaleY(0.08); }
          }
          @keyframes orla-pupil {
            0%,40%,100% { transform: translateX(0); }
            50%          { transform: translateX(1.5px); }
            70%          { transform: translateX(-1px); }
          }
          @keyframes orla-blush {
            0%,100% { opacity: 0.4; }
            50%      { opacity: 0.7; }
          }
          @keyframes orla-thinking-dot {
            0%,80%,100% { opacity: 0.2; transform: scale(0.7); }
            40%          { opacity: 1;   transform: scale(1); }
          }
          .orla-float    { animation: ${animated ? "orla-float 3s ease-in-out infinite" : "none"}; }
          .orla-tl1      { animation: ${animated ? "orla-tentacle-l1 2.2s ease-in-out infinite" : "none"}; }
          .orla-tl2      { animation: ${animated ? "orla-tentacle-l2 2.6s ease-in-out infinite 0.3s" : "none"}; }
          .orla-tr1      { animation: ${animated ? "orla-tentacle-r1 2.2s ease-in-out infinite 0.15s" : "none"}; }
          .orla-tr2      { animation: ${animated ? "orla-tentacle-r2 2.6s ease-in-out infinite 0.45s" : "none"}; }
          .orla-tc       { animation: ${animated ? "orla-tentacle-c 2.8s ease-in-out infinite" : "none"}; }
          .orla-blink    { animation: ${animated ? "orla-blink 4s ease-in-out infinite" : "none"}; }
          .orla-pupil    { animation: ${animated ? "orla-pupil 5s ease-in-out infinite" : "none"}; }
          .orla-blush    { animation: ${animated ? "orla-blush 3s ease-in-out infinite" : "none"}; }
          .orla-dot1     { animation: ${animated ? "orla-thinking-dot 1.2s ease-in-out infinite 0s" : "none"}; }
          .orla-dot2     { animation: ${animated ? "orla-thinking-dot 1.2s ease-in-out infinite 0.4s" : "none"}; }
          .orla-dot3     { animation: ${animated ? "orla-thinking-dot 1.2s ease-in-out infinite 0.8s" : "none"}; }
        `}</style>
      </defs>

      {/* Grupo flutuante principal */}
      <g className="orla-float" filter={`url(#${id}-shadow)`}>

        {/* ── TENTÁCULOS (atrás do corpo) ─────────── */}

        {/* Tentáculo traseiro esquerdo */}
        <g className="orla-tl2">
          <path
            d="M38 78 C28 85 20 92 22 102 C24 110 30 112 34 108 C36 105 35 100 32 97 C29 94 28 90 33 88 C38 86 42 90 44 95"
            stroke={bodyDim} strokeWidth="7" strokeLinecap="round" fill="none"
          />
          {/* Ventosas */}
          <circle cx="26" cy="98"  r="2.5" fill={dark} opacity="0.5" />
          <circle cx="30" cy="106" r="2"   fill={dark} opacity="0.4" />
        </g>

        {/* Tentáculo traseiro direito */}
        <g className="orla-tr2">
          <path
            d="M82 78 C92 85 100 92 98 102 C96 110 90 112 86 108 C84 105 85 100 88 97 C91 94 92 90 87 88 C82 86 78 90 76 95"
            stroke={bodyDim} strokeWidth="7" strokeLinecap="round" fill="none"
          />
          <circle cx="94" cy="98"  r="2.5" fill={dark} opacity="0.5" />
          <circle cx="90" cy="106" r="2"   fill={dark} opacity="0.4" />
        </g>

        {/* ── CORPO ───────────────────────────────── */}
        <ellipse
          cx="60" cy="55"
          rx="34" ry="30"
          fill={`url(#${id}-body)`}
        />

        {/* Brilho no corpo */}
        <ellipse
          cx="60" cy="55"
          rx="34" ry="30"
          fill={`url(#${id}-shine)`}
        />

        {/* ── SAIA / MANTO ────────────────────────── */}
        <path
          d="M26 68 Q30 72 34 70 Q38 75 42 72 Q46 78 50 74 Q54 80 58 76 Q60 82 62 76 Q66 80 70 74 Q74 78 78 72 Q82 75 86 70 Q90 72 94 68 Q88 80 60 80 Q32 80 26 68Z"
          fill={`url(#${id}-body)`}
        />

        {/* ── TENTÁCULOS DA FRENTE ─────────────────── */}

        {/* Tentáculo frente esquerdo */}
        <g className="orla-tl1">
          <path
            d="M40 78 C32 86 26 95 28 106 C30 114 38 116 42 110 C44 106 42 100 38 97 C35 94 34 88 40 86 C46 84 50 90 52 96"
            stroke={body} strokeWidth="8" strokeLinecap="round" fill="none"
          />
          <circle cx="31"  cy="101" r="2.5" fill={dark} opacity="0.4" />
          <circle cx="35"  cy="109" r="2"   fill={dark} opacity="0.35" />
          <circle cx="41"  cy="113" r="1.5" fill={dark} opacity="0.3" />
        </g>

        {/* Tentáculo frente direito */}
        <g className="orla-tr1">
          <path
            d="M80 78 C88 86 94 95 92 106 C90 114 82 116 78 110 C76 106 78 100 82 97 C85 94 86 88 80 86 C74 84 70 90 68 96"
            stroke={body} strokeWidth="8" strokeLinecap="round" fill="none"
          />
          <circle cx="89"  cy="101" r="2.5" fill={dark} opacity="0.4" />
          <circle cx="85"  cy="109" r="2"   fill={dark} opacity="0.35" />
          <circle cx="79"  cy="113" r="1.5" fill={dark} opacity="0.3" />
        </g>

        {/* Tentáculo central esquerdo */}
        <g className="orla-tc">
          <path
            d="M52 80 C46 90 44 100 48 110 C51 118 58 118 60 112 C62 106 59 98 55 95"
            stroke={body} strokeWidth="7.5" strokeLinecap="round" fill="none"
          />
          <circle cx="47" cy="104" r="2" fill={dark} opacity="0.35" />
          <circle cx="50" cy="112" r="1.5" fill={dark} opacity="0.3" />
        </g>

        {/* Tentáculo central direito */}
        <g className="orla-tc">
          <path
            d="M68 80 C74 90 76 100 72 110 C69 118 62 118 60 112 C58 106 61 98 65 95"
            stroke={body} strokeWidth="7.5" strokeLinecap="round" fill="none"
          />
          <circle cx="73" cy="104" r="2" fill={dark} opacity="0.35" />
          <circle cx="70" cy="112" r="1.5" fill={dark} opacity="0.3" />
        </g>

        {/* ── OLHOS ───────────────────────────────── */}

        {/* Olho esquerdo — sombra */}
        <ellipse cx="47" cy="50" rx="9.5" ry="10" fill="rgba(0,0,0,0.15)" />
        {/* Olho esquerdo — branco */}
        <ellipse cx="47" cy="49" rx="9" ry="9.5" fill={white} />
        {/* Pupila esquerda */}
        <g className="orla-blink" style={{ transformOrigin: "47px 49px" }}>
          <g
            className={pupilOffset ? undefined : "orla-pupil"}
            style={
              pupilOffset
                ? { transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }
                : { transformOrigin: "47px 49px" }
            }
          >
            <circle cx="47" cy="50" r="5.5" fill={dark} />
            <circle cx="44.5" cy="47.5" r="2" fill={white} opacity="0.9" />
            <circle cx="49"   cy="52"   r="1" fill={white} opacity="0.5" />
            {eyeStyle === "happy" && (
              <path d="M43 52 Q47 56 51 52" stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            )}
            {eyeStyle === "thinking" && (
              <path d="M44 48 L50 48" stroke={white} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            )}
          </g>
        </g>

        {/* Olho direito — sombra */}
        <ellipse cx="73" cy="50" rx="9.5" ry="10" fill="rgba(0,0,0,0.15)" />
        {/* Olho direito — branco */}
        <ellipse cx="73" cy="49" rx="9" ry="9.5" fill={white} />
        {/* Pupila direita */}
        <g className="orla-blink" style={{ transformOrigin: "73px 49px" }}>
          <g
            className={pupilOffset ? undefined : "orla-pupil"}
            style={
              pupilOffset
                ? { transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }
                : { transformOrigin: "73px 49px" }
            }
          >
            <circle cx="73" cy="50" r="5.5" fill={dark} />
            <circle cx="70.5" cy="47.5" r="2" fill={white} opacity="0.9" />
            <circle cx="75"   cy="52"   r="1" fill={white} opacity="0.5" />
            {eyeStyle === "happy" && (
              <path d="M69 52 Q73 56 77 52" stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            )}
            {eyeStyle === "thinking" && (
              <path d="M70 48 L76 48" stroke={white} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            )}
          </g>
        </g>

        {/* ── BOCHECHA / BLUSH ────────────────────── */}
        <ellipse cx="34" cy="58" rx="6" ry="4" fill={blush} className="orla-blush" />
        <ellipse cx="86" cy="58" rx="6" ry="4" fill={blush} className="orla-blush" />

        {/* ── BOQUINHA ────────────────────────────── */}
        {eyeStyle === "happy" ? (
          <path d="M54 63 Q60 69 66 63" stroke={bodyDim} strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : eyeStyle === "thinking" ? (
          <path d="M56 64 Q60 63 64 64" stroke={bodyDim} strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M55 63 Q60 67 65 63" stroke={bodyDim} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* ── THINKING DOTS (mood=thinking) ────────── */}
        {mood === "thinking" && (
          <g>
            <circle cx="74" cy="38" r="3" fill={white} className="orla-dot1" />
            <circle cx="82" cy="32" r="3.5" fill={white} className="orla-dot2" />
            <circle cx="91" cy="25" r="4" fill={white} className="orla-dot3" />
          </g>
        )}

        {/* ── TAG "AI" no corpo ────────────────────── */}
        <rect x="52" y="62" width="16" height="8" rx="4" fill={bodyDim} opacity="0.6" />
        <text x="60" y="68.5" textAnchor="middle" fill={white} fontSize="5" fontWeight="bold" fontFamily="system-ui">AI</text>

      </g>
    </svg>
  );
}