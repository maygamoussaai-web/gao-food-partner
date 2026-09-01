/**
 * Affiche un nombre dont chaque chiffre glisse verticalement lors des
 * changements de valeur (façon compteur de gare). Implémenté en CSS pur
 * (transform + transition) pour ne dépendre d'aucune librairie d'animation.
 */
export function SlidingNumber({
  value,
  padStart = false,
  className = "",
}: {
  value: number;
  padStart?: boolean;
  className?: string;
}) {
  const texte = padStart ? String(Math.max(0, Math.trunc(value))).padStart(2, "0") : String(value);

  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      {texte.split("").map((caractere, i) =>
        /\d/.test(caractere) ? (
          <SingleDigit key={i} digit={Number(caractere)} />
        ) : (
          <span key={i} aria-hidden className="inline-block">
            {caractere}
          </span>
        ),
      )}
    </span>
  );
}

function SingleDigit({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-baseline">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex h-[1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}
