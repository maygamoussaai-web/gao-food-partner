import { useEffect, useState } from "react";

import { SlidingNumber } from "@/components/sliding-number";

/** Horloge temps réel en cadre, chiffres glissants (voir SlidingNumber). */
export function Clock({ className = "" }: { className?: string }) {
  const [heure, setHeure] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setHeure(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-2xl border border-border/70 bg-card/70 px-3.5 py-2 font-mono text-lg font-semibold text-foreground shadow-[var(--shadow-card)] backdrop-blur ${className}`}
    >
      <SlidingNumber value={heure.getHours()} padStart />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={heure.getMinutes()} padStart />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={heure.getSeconds()} padStart />
    </div>
  );
}
