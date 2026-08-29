import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Field, FormError, Input } from "@/components/form-field";
import { MediaPicker } from "@/components/media-picker";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { enregistrerBrouillonInscription, lireBrouillonInscription } from "@/lib/inscription-draft";

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
  component: InscriptionEtape1,
});

function InscriptionEtape1() {
  const navigate = useNavigate();
  const existant = lireBrouillonInscription();
  const [nom, setNom] = useState(existant?.restaurant_nom ?? "");
  const [quartier, setQuartier] = useState(existant?.restaurant_quartier ?? "");
  const [logo, setLogo] = useState<File | null>(existant?.logo ?? null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nom.trim() || !quartier.trim()) {
      setError("Le nom et le quartier du restaurant sont obligatoires.");
      return;
    }
    enregistrerBrouillonInscription({
      restaurant_nom: nom.trim(),
      restaurant_quartier: quartier.trim(),
      logo,
    });
    void navigate({ to: "/inscription-compte" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark className="text-sm" />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="text-primary">Étape 1/2</span>
          <span aria-hidden>·</span>
          <span>Votre restaurant</span>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span className="h-1 flex-1 rounded-full bg-muted" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-foreground">Parlez-nous de votre restaurant</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Ces informations apparaîtront sur votre vitrine.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <FormError>{error}</FormError>

          <Field label="Nom du restaurant">
            <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </Field>

          <Field label="Quartier">
            <Input
              required
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              placeholder="Ex : Château, Djidara…"
            />
          </Field>

          <MediaPicker
            label="Logo (facultatif)"
            accept="image/*"
            value={logo}
            onChange={setLogo}
            rond
            hint="Prenez une photo ou choisissez-la dans votre galerie."
          />

          <Button type="submit" size="lg" className="w-full">
            Continuer
          </Button>
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
