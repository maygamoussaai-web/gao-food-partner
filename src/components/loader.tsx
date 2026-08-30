/**
 * Indicateurs de chargement sur-mesure GAO FOOD.
 * Un plat qui « respire » sous un anneau dégradé qui tourne, plus la vapeur
 * qui s'échappe : identité maison, jamais le spinner générique.
 */
export function GaoLoader({
  taille = 56,
  texte,
  className = "",
}: {
  taille?: number;
  texte?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative" style={{ width: taille, height: taille }}>
        {/* vapeur */}
        <div className="absolute inset-x-0 -top-2 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-3 w-1 rounded-full bg-primary/50"
              style={{
                animation: "gao-steam 1.8s ease-in-out infinite",
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </div>

        {/* anneau dégradé rotatif */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "var(--gradient-primary)",
            maskImage: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)",
            WebkitMaskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)",
            animation: "gao-spin 1.1s linear infinite",
            opacity: 0.9,
          }}
        />

        {/* plat qui respire */}
        <div
          className="absolute inset-[22%] rounded-full"
          style={{
            background: "var(--gradient-primary)",
            animation: "gao-breathe 1.6s ease-in-out infinite",
            boxShadow: "var(--shadow-glow)",
          }}
        />
      </div>

      <span className="text-xs font-medium text-muted-foreground">
        {texte ?? "Chargement…"}
      </span>
    </div>
  );
}

/** Petit loader inline (boutons, lignes). */
export function GaoDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-current"
          style={{
            animation: "gao-breathe 1s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton ${className}`}>
      <span className="skeleton-shine" />
    </div>
  );
}

/** Squelette de liste animé, utilisé pendant le chargement des données. */
export function SkeletonListe({ lignes = 4 }: { lignes?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lignes }).map((_, i) => (
        <div
          key={i}
          className="stagger card-surface flex items-center gap-3 p-3"
          style={{ ["--i" as string]: i }}
        >
          <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
