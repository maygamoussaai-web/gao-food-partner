/**
 * <DancingMan /> — mascotte SVG animée de GAO FOOD.
 * Un bonhomme stylé en costard et lunettes de soleil qui danse et tire
 * (à la corde) le formulaire de connexion / d'inscription vers le visiteur.
 * 100 % SVG + keyframes CSS (voir styles.css), aucun asset externe.
 * Toutes les animations sont neutralisées par `prefers-reduced-motion`.
 */
export function DancingMan({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 280"
      className={className}
      role="img"
      aria-label="Personnage en costume et lunettes de soleil qui danse en tirant le formulaire"
    >
      <defs>
        <linearGradient id="gaoSuit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--night)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient id="gaoTie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--secondary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <linearGradient id="gaoRope" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <radialGradient id="gaoSpot" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo / projecteur */}
      <ellipse cx="104" cy="150" rx="98" ry="112" fill="url(#gaoSpot)" className="animate-pulse-soft" />

      {/* notes de musique */}
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          style={{
            animation: `gao-note-float ${3.4 + i * 0.6}s ease-out infinite`,
            animationDelay: `${i * 1.1}s`,
            transformOrigin: "center",
          }}
        >
          <circle cx={38 + i * 16} cy={92 - i * 14} r="4.5" fill="var(--secondary)" />
          <rect x={41.5 + i * 16} y={74 - i * 14} width="2" height="18" rx="1" fill="var(--secondary)" />
        </g>
      ))}

      {/* ombre au sol */}
      <ellipse cx="104" cy="252" rx="46" ry="8" fill="var(--night)" opacity="0.18" />

      {/* corde tirée vers le formulaire (à droite) */}
      <g style={{ animation: "gao-rope 1.15s ease-in-out infinite" }}>
        <path
          d="M148 148 C 182 142, 202 150, 236 146"
          stroke="url(#gaoRope)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="236" cy="146" r="5" fill="var(--accent)" />
      </g>

      {/* corps qui danse */}
      <g style={{ animation: "gao-dance-body 1.15s ease-in-out infinite", transformOrigin: "104px 190px" }}>
        {/* jambes */}
        <g style={{ animation: "gao-dance-leg-l 1.15s ease-in-out infinite", transformOrigin: "94px 196px" }}>
          <rect x="86" y="192" width="16" height="56" rx="8" fill="var(--night)" />
          <rect x="80" y="240" width="26" height="10" rx="5" fill="var(--foreground)" />
        </g>
        <g style={{ animation: "gao-dance-leg-r 1.15s ease-in-out infinite", transformOrigin: "116px 196px" }}>
          <rect x="108" y="192" width="16" height="56" rx="8" fill="var(--night)" />
          <rect x="104" y="240" width="26" height="10" rx="5" fill="var(--foreground)" />
        </g>

        {/* veste */}
        <path
          d="M78 116 C 78 100, 88 92, 104 92 C 120 92, 130 100, 130 116 L 134 190 C 134 197, 128 200, 120 200 L 88 200 C 80 200, 74 197, 74 190 Z"
          fill="url(#gaoSuit)"
        />
        {/* chemise + cravate */}
        <path d="M96 94 L104 132 L112 94 L104 88 Z" fill="var(--card)" />
        <path d="M104 104 L110 118 L104 140 L98 118 Z" fill="url(#gaoTie)" />
        {/* revers */}
        <path d="M96 94 L88 96 L92 132 Z" fill="var(--night)" opacity="0.55" />
        <path d="M112 94 L120 96 L116 132 Z" fill="var(--night)" opacity="0.55" />

        {/* bras gauche : salut */}
        <g style={{ animation: "gao-wave-arm 1.15s ease-in-out infinite", transformOrigin: "80px 112px" }}>
          <rect x="60" y="108" width="16" height="56" rx="8" fill="url(#gaoSuit)" transform="rotate(18 68 112)" />
          <circle cx="52" cy="158" r="9" fill="var(--accent)" />
        </g>

        {/* bras droit : tire la corde */}
        <g style={{ animation: "gao-pull-arm 1.15s ease-in-out infinite", transformOrigin: "128px 112px" }}>
          <rect x="126" y="106" width="16" height="52" rx="8" fill="url(#gaoSuit)" transform="rotate(-24 134 112)" />
          <circle cx="148" cy="148" r="9.5" fill="var(--accent)" />
        </g>

        {/* tête */}
        <g style={{ animation: "gao-dance-head 1.15s ease-in-out infinite", transformOrigin: "104px 86px" }}>
          <rect x="98" y="78" width="12" height="16" rx="6" fill="var(--accent)" />
          <circle cx="104" cy="58" r="26" fill="var(--accent)" />
          {/* cheveux */}
          <path d="M78 54 C 80 30, 128 30, 130 54 C 122 44, 86 44, 78 54 Z" fill="var(--night)" />
          {/* lunettes de soleil */}
          <g>
            <rect x="82" y="50" width="20" height="13" rx="6" fill="var(--night)" />
            <rect x="106" y="50" width="20" height="13" rx="6" fill="var(--night)" />
            <rect x="100" y="55" width="8" height="3" rx="1.5" fill="var(--night)" />
            <rect
              x="85"
              y="52"
              width="6"
              height="4"
              rx="2"
              fill="var(--card)"
              style={{ animation: "gao-glint 4s linear infinite" }}
            />
          </g>
          {/* sourire */}
          <path d="M96 70 Q 104 78, 112 70" stroke="var(--night)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
