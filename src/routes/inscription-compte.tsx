import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Field, FormError, Input } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth-api";
import { fileToBase64 } from "@/lib/home-api";
import { lireBrouillonInscription, viderBrouillonInscription } from "@/lib/inscription-draft";

export const Route = createFileRoute("/inscription-compte")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Créer un compte restaurateur — GAO FOOD" },
      {
        name: "description",
        content: "Terminez la création de votre compte restaurateur GAO FOOD.",
      },
    ],
  }),
  component: InscriptionEtape2,
});

function InscriptionEtape2() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const brouillon = lireBrouillonInscription();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [numero, setNumero] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Pas de brouillon (accès direct ou page rechargée) : on revient à l'étape 1.
  useEffect(() => {
    if (!brouillon) void navigate({ to: "/inscription" });
  }, [brouillon, navigate]);

  if (!brouillon) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setBusy(true);
    try {
      let logoPart: { restaurant_logo_base64?: string; restaurant_logo_content_type?: string } = {};
      if (brouillon!.logo) {
        const base64 = await fileToBase64(brouillon!.logo);
        logoPart = { restaurant_logo_base64: base64, restaurant_logo_content_type: brouillon!.logo.type };
      }

      const payload = await authApi.register({
        prenom: prenom.trim(),
        nom: nom.trim(),
        numero: numero.trim(),
        mot_de_passe: motDePasse,
        restaurant_nom: brouillon!.restaurant_nom,
        restaurant_quartier: brouillon!.restaurant_quartier,
        ...logoPart,
      });
      viderBrouillonInscription();
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
        <button
          type="button"
          onClick={() => void navigate({ to: "/inscription" })}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>

        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="text-primary">Étape 2/2</span>
          <span aria-hidden>·</span>
          <span>Vos informations</span>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span className="h-1 flex-1 rounded-full bg-primary" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-foreground">Et vous, qui êtes-vous ?</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Pour {brouillon.restaurant_nom}, à {brouillon.restaurant_quartier}.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <FormError>{error}</FormError>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom">
              <Input required value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label="Nom">
              <Input required value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" />
            </Field>
          </div>

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

          <Field label="Mot de passe" hint="6 caractères minimum.">
            <PasswordInput
              autoComplete="new-password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
          </Field>

          <Field label="Confirmer le mot de passe">
            <PasswordInput
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Création…" : "Créer mon compte"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            En vous inscrivant sur ce site vous acceptez{" "}
            <Link to="/conditions" className="underline underline-offset-4">
              nos conditions, nos politiques de sécurité et de confidentialité
            </Link>
            .
          </p>
        </form>
      </main>
    </div>
  );
}
