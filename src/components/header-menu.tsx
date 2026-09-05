import { Link } from "@tanstack/react-router";
import { LogOut, MoreVertical, Store, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DeconnexionConfirm } from "@/components/logout-confirm";

export function HeaderMenu() {
  const [ouvert, setOuvert] = useState(false);
  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOuvert(false);
      }
    }
    if (!ouvert) return;
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ouvert]);

  const items = [
    { to: "/compte", icon: UserRound, label: "Mon compte" },
    { to: "/restaurant", icon: Store, label: "Mon restaurant" },
  ] as const;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
        className="press flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground active:scale-90"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {ouvert && (
        <div className="animate-rise absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-sheet)] backdrop-blur-xl">
          <div className="space-y-0.5">
            {items.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOuvert(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            ))}

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              onClick={() => {
                setOuvert(false);
                setConfirmDeconnexion(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <DeconnexionConfirm ouvert={confirmDeconnexion} onFermer={() => setConfirmDeconnexion(false)} />
    </div>
  );
}
