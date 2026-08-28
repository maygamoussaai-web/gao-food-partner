import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Home, UserRound, UtensilsCrossed } from "lucide-react";
import type { ComponentType } from "react";

const onglets: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/tableau-de-bord", label: "Accueil", icon: Home },
  { to: "/commandes", label: "Commandes", icon: ClipboardList },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/compte", label: "Compte", icon: UserRound },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2">
        {onglets.map(({ to, label, icon: Icon }) => {
          const actif = pathname === to || (to !== "/tableau-de-bord" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs"
            >
              <Icon
                className={`h-5 w-5 ${actif ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={actif ? "font-medium text-primary" : "text-muted-foreground"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Hauteur de la nav + zone de sécurité, à réserver en bas des pages avec `pb-[var(--bottom-nav-space)]`. */
export const BOTTOM_NAV_SPACE = "calc(4.5rem + env(safe-area-inset-bottom))";
