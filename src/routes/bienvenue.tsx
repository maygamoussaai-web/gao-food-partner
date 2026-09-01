import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { GaoLoader } from "@/components/loader";
import { OnboardingBackground } from "@/components/svg-backgrounds";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { readToken } from "@/lib/auth-api";
import { homeApi } from "@/lib/home-api";

export const Route = createFileRoute("/bienvenue")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Bienvenue — GAO FOOD" }],
  }),
  component: Bienvenue,
});

/** Durée minimale à l'écran, pour éviter un flash même si tout charge vite. */
const DUREE_MIN_MS = 1100;

function Bienvenue() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { pret, restaurateur } = useAuth();

  useEffect(() => {
    if (!pret) return;

    const token = readToken();
    if (!token || !restaurateur) {
      void navigate({ to: "/connexion", replace: true });
      return;
    }

    let annule = false;
    const debut = Date.now();

    qc.prefetchQuery({
      queryKey: ["home", token],
      queryFn: () => homeApi.getHome(token),
    })
      .catch(() => {
        /* l'accueil réessaiera lui-même le chargement si besoin */
      })
      .finally(() => {
        if (annule) return;
        const restant = Math.max(0, DUREE_MIN_MS - (Date.now() - debut));
        setTimeout(() => {
          if (!annule) void navigate({ to: "/tableau-de-bord", replace: true });
        }, restant);
      });

    return () => {
      annule = true;
    };
  }, [pret, restaurateur, qc, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <OnboardingBackground />

      <div className="animate-rise flex flex-col items-center gap-6 text-center">
        <Wordmark className="text-2xl" />
        <p className="max-w-xs text-[15px] text-muted-foreground">
          {restaurateur ? `Heureux de vous revoir, ${restaurateur.prenom} 👋` : "Préparation de votre espace…"}
        </p>
        <GaoLoader texte="On installe votre tableau de bord…" />
      </div>
    </div>
  );
}
