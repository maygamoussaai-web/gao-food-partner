import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Home, UserRound, UtensilsCrossed } from "lucide-react";
import type { ComponentType } from "react";

import { useAuth } from "@/hooks/use-auth";
import { commandesApi } from "@/lib/commandes-api";

const onglets: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/tableau-de-bord", label: "Accueil", icon: Home },
  { to: "/commandes", label: "Commandes", icon: ClipboardList },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/compte", label: "Compte", icon: UserRound },
];

/** Nombre de commandes non lues (statut `en_cours`), rafraîchi périodiquement. */
export function useCommandesNonLues() {
  const { token } = useAuth();
  const { data } = useQuery({
    queryKey: ["commandes-badge", token],
    queryFn: () => commandesApi.list(token as string, { mode: "commandes" }),
    enabled: Boolean(token),
    refetchInterval: 45_000,
  });
  return (data?.en_cours ?? []).filter((c) => c.statut === "en_cours").length;
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const badge = useCommandesNonLues();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2">
        {onglets.map(({ to, label, icon: Icon }) => {
          const actif = pathname === to || (to !== "/tableau-de-bord" && pathname.startsWith(to));
          const compteur = to === "/commandes" ? badge : 0;
          return (
            <Link
              key={to}
              to={to}
              className="press group flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] active:scale-95"
            >
              <span className="relative">
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                    actif
                      ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {compteur > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {compteur > 99 ? "99+" : compteur}
                  </span>
                )}
              </span>
              <span className={actif ? "font-bold text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Hauteur de la nav + zone de sécurité, à réserver en bas des pages. */
export const BOTTOM_NAV_SPACE = "calc(4.75rem + env(safe-area-inset-bottom))";
