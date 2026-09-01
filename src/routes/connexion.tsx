import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthScene } from "@/components/auth-scene";
import { Field, FormError, Input } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui-kit";
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
    <AuthScene
      accroche="Espace restaurateur"
      titre="Content de vous revoir 👋"
      texte="Entrez votre numéro et votre mot de passe pour retrouver votre restaurant."
      bas={
        <div className="space-y-2 text-center text-sm">
          <Link
            to="/mot-de-passe-oublie"
            className="block text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Mot de passe oublié ?
          </Link>
          <p className="text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="font-semibold text-primary underline underline-offset-4">
              Créer un compte
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
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
          <PasswordInput
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </AuthScene>
  );
}
