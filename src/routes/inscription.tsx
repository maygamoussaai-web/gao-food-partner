import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Field, FormError, Input } from "@/components/form-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth-api";

export const Route = createFileRoute("/inscription")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Créer un compte restaurateur — GAO FOOD" },
      {
        name: "description",
        content:
          "Inscrivez votre restaurant sur GAO FOOD : vitrine digitale, commandes en ligne et gestion du menu à Gao.",
      },
      { property: "og:title", content: "Créer un compte restaurateur — GAO FOOD" },
      {
        property: "og:description",
        content: "Inscrivez votre restaurant de Gao et recevez vos commandes en ligne.",
      },
    ],
  }),
  component: Inscription,
});

function Inscription() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    numero: "",
    mot_de_passe: "",
    confirmation: "",
    restaurant_nom: "",
    restaurant_quartier: "",
    restaurant_logo_url: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.mot_de_passe.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (form.mot_de_passe !== form.confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    try {
      const payload = await authApi.register({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        numero: form.numero.trim(),
        mot_de_passe: form.mot_de_passe,
        restaurant_nom: form.restaurant_nom.trim(),
        restaurant_quartier: form.restaurant_quartier.trim(),
        ...(form.restaurant_logo_url.trim()
          ? { restaurant_logo_url: form.restaurant_logo_url.trim() }
          : {}),
      });
      setSession(payload);
      await navigate({ to: "/tableau-de-bord" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
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

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground">Créer votre compte</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Vos informations personnelles et celles de votre restaurant.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <FormError>{error}</FormError>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <Input required value={form.prenom} onChange={set("prenom")} autoComplete="given-name" />
            </Field>
            <Field label="Nom">
              <Input required value={form.nom} onChange={set("nom")} autoComplete="family-name" />
            </Field>
          </div>

          <Field label="Numéro de téléphone">
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={form.numero}
              onChange={set("numero")}
              placeholder="Ex : 76 00 00 00"
            />
          </Field>

          <Field label="Mot de passe" hint="6 caractères minimum.">
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={form.mot_de_passe}
              onChange={set("mot_de_passe")}
            />
          </Field>

          <Field label="Confirmer le mot de passe">
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmation}
              onChange={set("confirmation")}
            />
          </Field>

          <div className="pt-2">
            <h2 className="text-sm font-semibold text-foreground">Votre restaurant</h2>
          </div>

          <Field label="Nom du restaurant">
            <Input required value={form.restaurant_nom} onChange={set("restaurant_nom")} />
          </Field>

          <Field label="Quartier">
            <Input
              required
              value={form.restaurant_quartier}
              onChange={set("restaurant_quartier")}
              placeholder="Ex : Château, Djidara…"
            />
          </Field>

          <Field label="Logo (URL)" hint="Facultatif — l'envoi d'image arrivera plus tard.">
            <Input
              type="url"
              value={form.restaurant_logo_url}
              onChange={set("restaurant_logo_url")}
              placeholder="https://…"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Création…" : "Créer mon compte"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            En créant un compte, vous acceptez les{" "}
            <Link to="/conditions" className="underline underline-offset-4">
              conditions d'utilisation
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/connexion" className="font-medium text-primary underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      </main>
    </div>
  );
}
