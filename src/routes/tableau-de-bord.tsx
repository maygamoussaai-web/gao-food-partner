import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, Card } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/tableau-de-bord")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tableau de bord — GAO FOOD" },
      {
        name: "description",
        content:
          "Vue d'ensemble de votre restaurant sur GAO FOOD : commandes, menu, promotions et solde.",
      },
      { property: "og:title", content: "Tableau de bord — GAO FOOD" },
      {
        property: "og:description",
        content: "Pilotez votre restaurant de Gao depuis un seul écran.",
      },
    ],
  }),
  component: TableauDeBord,
});

function TableauDeBord() {
  const navigate = useNavigate();
  const { loading, restaurateur, restaurant, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !restaurateur) void navigate({ to: "/connexion" });
  }, [loading, restaurateur, navigate]);

  if (loading || !restaurateur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <Wordmark className="text-sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              signOut();
              void navigate({ to: "/connexion" });
            }}
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-4 px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Bonjour {restaurateur.prenom}
        </h1>

        <Card>
          <h2 className="text-base font-semibold text-foreground">
            {restaurant?.nom ?? "Votre restaurant"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quartier : {restaurant?.quartier ?? "—"}
          </p>
          {restaurant?.statut === "suspendu" && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Restaurant suspendu. {restaurant.motif_suspension}
            </p>
          )}
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">
            Les pages Menu, Commandes, Promotions et Compte arrivent ensuite.
          </p>
        </Card>
      </main>
    </div>
  );
}
