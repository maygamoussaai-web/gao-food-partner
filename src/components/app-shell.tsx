import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { BottomNav, BOTTOM_NAV_SPACE } from "@/components/bottom-nav";
import { GaoLoader, SkeletonListe } from "@/components/loader";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

/**
 * Coquille commune des pages authentifiées : fond mesh, en-tête collant,
 * contenu centré et barre de navigation basse.
 */
export function AppShell({
  titre,
  sousTitre,
  retour,
  actions,
  sousHeader,
  children,
}: {
  titre: string;
  sousTitre?: string;
  retour?: boolean;
  actions?: ReactNode;
  sousHeader?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { pret, restaurateur } = useAuth();

  useEffect(() => {
    if (pret && !restaurateur) void navigate({ to: "/connexion", replace: true });
  }, [pret, restaurateur, navigate]);

  if (!pret || !restaurateur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="bg-mesh" />
        <GaoLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: BOTTOM_NAV_SPACE }}>
      <div className="bg-mesh" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          {retour && (
            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Retour"
              className="press -ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-bold leading-tight text-foreground">
              {titre}
            </h1>
            {sousTitre ? (
              <p className="truncate text-xs text-muted-foreground">{sousTitre}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {actions}
            <ThemeToggle />
          </div>
        </div>
        {sousHeader}
      </header>

      <main className="animate-fade mx-auto w-full max-w-3xl px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}

export function Chargement({ lignes = 4 }: { lignes?: number }) {
  return <SkeletonListe lignes={lignes} />;
}

export function EtatVide({
  icone,
  titre,
  texte,
  action,
}: {
  icone?: ReactNode;
  titre: string;
  texte?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-rise flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center backdrop-blur">
      {icone ? (
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icone}
        </div>
      ) : null}
      <p className="text-[15px] font-semibold text-foreground">{titre}</p>
      {texte ? <p className="max-w-xs text-xs text-muted-foreground">{texte}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErreurBloc({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="animate-rise rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="press mt-2 rounded-lg border border-destructive/40 px-3 py-1 text-xs font-semibold active:scale-95"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
