import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Field, FormError, Input } from "@/components/form-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth-api";

export const Route = createFileRoute("/connexion")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion restaurateur — GAO FOOD" },
      {
        name: "description",
        content:
          "Connectez-vous à votre espace restaurateur GAO FOOD pour gérer votre menu et vos commandes.",
      },
      { property: "og:title", content: "Connexion restaurateur — GAO FOOD" },
      {
        property: "og:description",
        content: "Accédez à votre espace restaurateur GAO FOOD à Gao.",
      },
    ],
  }),
  component: Connexion,
});

function Connexion() {
  const navigate = useNavigate();
  const { restaurateur, setSession } = useAuth();
  const [numero, setNumero] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (restaurateur) void navigate({ to: "/tableau-de-bord" });
  }, [restaurateur, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = await authApi.login(numero.trim(), motDePasse);
      setSession(payload);
      await navigate({ to: "/tableau-de-bord" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark className="text-sm" />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Connexion</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Entrez votre numéro et votre mot de passe pour accéder à votre restaurant.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <FormError>{error}</FormError>

          <Field label="Numéro de téléphone">
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex : 76 00 00 00"
            />
          </Field>

          <Field label="Mot de passe">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <Link
            to="/mot-de-passe-oublie"
            className="block text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Mot de passe oublié ?
          </Link>
          <p className="text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="font-medium text-primary underline underline-offset-4">
              Créer un compte
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
