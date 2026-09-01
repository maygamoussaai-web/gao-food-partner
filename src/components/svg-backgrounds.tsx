/**
 * Arrière-plans SVG génératifs façon Haikei, construits avec la palette
 * GAO FOOD (corail primaire / orange secondaire / bleu nuit en accent
 * discret). Deux variantes :
 *  - <OnboardingBackground /> : vivante et animée, pour les écrans d'accueil
 *    de bienvenue (rotation/dérive lente des formes, respecte
 *    prefers-reduced-motion via les utilitaires globaux de styles.css).
 *  - <AppBackground /> : sobre et statique, pour le reste de l'application
 *    (remplace l'ancien fond `bg-mesh`).
 * Les deux sont fixes en arrière-plan (`-z-10`), non interactives.
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

export function OnboardingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 1400"
        preserveAspectRatio="xMidYMid slice"
      >
        <Degrades />

        <g className="animate-blob-a" style={{ opacity: 0.55 }}>
          <path
            fill="url(#gaoBgPrimary)"
            d="M 90 210 C -30 340 -10 560 130 660 C 270 760 420 690 560 760 C 700 830 830 760 820 590 C 810 420 660 380 590 260 C 520 140 210 80 90 210 Z"
          />
        </g>

        <g className="animate-blob-b" style={{ opacity: 0.4 }}>
          <path
            fill="url(#gaoBgSecondary)"
            d="M 560 780 C 420 860 300 1010 380 1150 C 460 1290 700 1330 820 1220 C 940 1110 900 900 830 820 C 760 740 700 700 560 780 Z"
          />
        </g>

        <g className="animate-blob-a" style={{ opacity: 0.22, animationDuration: "30s" }}>
          <path
            fill="url(#gaoBgNight)"
            d="M 40 900 C -60 1020 10 1220 160 1250 C 310 1280 380 1140 320 1020 C 260 900 140 780 40 900 Z"
          />
        </g>
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
