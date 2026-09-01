/**
 * Arrière-plans SVG génératifs de GAO FOOD (palette corail / orange / bleu nuit).
 *  - <OnboardingBackground /> : très vivant et animé (blobs qui dérivent, anneaux
 *    en orbite, particules flottantes, trait lumineux qui court) pour l'onboarding
 *    et les écrans d'authentification.
 *  - <AppBackground /> : sobre et statique pour le reste de l'application.
 * Les deux sont fixes, non interactifs et respectent `prefers-reduced-motion`.
 */

function Degrades() {
  return (
    <defs>
      <linearGradient id="gaoBgPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "var(--primary)" }} />
        <stop offset="100%" style={{ stopColor: "var(--accent)" }} />
      </linearGradient>
      <linearGradient id="gaoBgSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "var(--secondary)" }} />
        <stop offset="100%" style={{ stopColor: "var(--primary)" }} />
      </linearGradient>
      <linearGradient id="gaoBgNight" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "var(--night)" }} />
        <stop offset="100%" style={{ stopColor: "var(--secondary)" }} />
      </linearGradient>
    </defs>
  );
}

const particules = [
  { x: 120, y: 220, r: 5, d: 0 },
  { x: 680, y: 180, r: 7, d: 1.4 },
  { x: 260, y: 640, r: 4, d: 2.2 },
  { x: 720, y: 720, r: 6, d: 0.8 },
  { x: 90, y: 1020, r: 5, d: 3 },
  { x: 620, y: 1150, r: 8, d: 1.9 },
  { x: 400, y: 400, r: 3.5, d: 2.6 },
  { x: 520, y: 980, r: 4.5, d: 0.4 },
];

export function OnboardingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 1400"
        preserveAspectRatio="xMidYMid slice"
      >
        <Degrades />

        {/* blobs organiques qui dérivent */}
        <g className="animate-blob-a" style={{ opacity: 0.55 }}>
          <path
            fill="url(#gaoBgPrimary)"
            d="M 90 210 C -30 340 -10 560 130 660 C 270 760 420 690 560 760 C 700 830 830 760 820 590 C 810 420 660 380 590 260 C 520 140 210 80 90 210 Z"
          />
        </g>

        <g className="animate-blob-b" style={{ opacity: 0.42 }}>
          <path
            fill="url(#gaoBgSecondary)"
            d="M 560 780 C 420 860 300 1010 380 1150 C 460 1290 700 1330 820 1220 C 940 1110 900 900 830 820 C 760 740 700 700 560 780 Z"
          />
        </g>

        <g className="animate-blob-a" style={{ opacity: 0.24, animationDuration: "30s" }}>
          <path
            fill="url(#gaoBgNight)"
            d="M 40 900 C -60 1020 10 1220 160 1250 C 310 1280 380 1140 320 1020 C 260 900 140 780 40 900 Z"
          />
        </g>

        {/* anneaux en orbite lente */}
        <g style={{ transformOrigin: "620px 300px" }} className="animate-orbit">
          <circle
            cx="620"
            cy="300"
            r="180"
            fill="none"
            stroke="url(#gaoBgPrimary)"
            strokeWidth="1.5"
            strokeDasharray="10 16"
            opacity="0.5"
          />
        </g>
        <g
          style={{ transformOrigin: "200px 1050px", animationDirection: "reverse", animationDuration: "55s" }}
          className="animate-orbit"
        >
          <circle
            cx="200"
            cy="1050"
            r="240"
            fill="none"
            stroke="url(#gaoBgSecondary)"
            strokeWidth="1.5"
            strokeDasharray="4 22"
            opacity="0.45"
          />
        </g>

        {/* trait lumineux qui court */}
        <path
          d="M -50 520 C 200 430, 420 640, 620 540 C 760 470, 820 520, 880 500"
          fill="none"
          stroke="url(#gaoBgPrimary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="60 540"
          opacity="0.65"
          style={{ animation: "gao-dash 9s linear infinite" }}
        />
        <path
          d="M -50 1180 C 180 1100, 380 1250, 600 1160 C 740 1105, 830 1150, 880 1130"
          fill="none"
          stroke="url(#gaoBgSecondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="40 560"
          opacity="0.55"
          style={{ animation: "gao-dash 13s linear infinite" }}
        />

        {/* particules flottantes */}
        {particules.map((p) => (
          <circle
            key={`${p.x}-${p.y}`}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="url(#gaoBgSecondary)"
            opacity="0.6"
            style={{
              animation: `gao-float-y ${7 + p.d}s ease-in-out infinite`,
              animationDelay: `${p.d}s`,
            }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/55 to-background" />
    </div>
  );
}

export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 1400"
        preserveAspectRatio="xMidYMid slice"
      >
        <Degrades />

        <path
          fill="url(#gaoBgPrimary)"
          opacity="0.16"
          d="M 60 -40 C -60 90 -20 260 110 320 C 240 380 360 300 470 340 C 580 380 690 320 660 190 C 630 60 420 20 320 -30 C 220 -80 140 -130 60 -40 Z"
        />
        <path
          fill="url(#gaoBgSecondary)"
          opacity="0.12"
          d="M 620 1080 C 500 1140 420 1270 500 1370 C 580 1470 760 1480 830 1380 C 900 1280 860 1140 800 1080 C 740 1020 700 1040 620 1080 Z"
        />
      </svg>
    </div>
  );
}
