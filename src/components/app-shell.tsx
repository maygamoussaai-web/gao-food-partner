import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { AskiaBackground } from "@/components/askia-background";
import { BottomNav, BOTTOM_NAV_SPACE } from "@/components/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

/**
 * Coquille commune des pages authentifiées : fond Askia, en-tête collant,
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
  const { loading, restaurateur } = useAuth();

  useEffect(() => {
    if (!loading && !restaurateur) void navigate({ to: "/connexion" });
  }, [loading, restaurateur, navigate]);

  if (loading || !restaurateur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="bg-askia min-h-screen" style={{ paddingBottom: BOTTOM_NAV_SPACE }}>
      <AskiaBackground />

      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          {retour && (
            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Retour"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-semibold leading-tight text-foreground">
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

      <main className="mx-auto w-full max-w-3xl px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}

export function Chargement({ lignes = 3 }: { lignes?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lignes }).map((_, i) => (
        <div
          key={i}
          className="h-[68px] animate-pulse rounded-xl border border-border/60 bg-muted/60"
        />
      ))}
    </div>
  );
}

export function EtatVide({ icone, titre, texte }: { icone?: ReactNode; titre: string; texte?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      {icone ? <div className="text-muted-foreground">{icone}</div> : null}
      <p className="text-sm font-medium text-foreground">{titre}</p>
      {texte ? <p className="max-w-xs text-xs text-muted-foreground">{texte}</p> : null}
    </div>
  );
}

export function ErreurBloc({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-destructive/40 px-3 py-1 text-xs font-medium"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
