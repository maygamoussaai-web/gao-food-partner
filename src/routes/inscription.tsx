import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthScene } from "@/components/auth-scene";
import { Field, FormError, Input } from "@/components/form-field";
import { MediaPicker } from "@/components/media-picker";
import { Button } from "@/components/ui-kit";
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

export function BarreEtape({ sur = 2, etape = 1 }: { sur?: number; etape?: number }) {
  return (
    <div className="mt-2 flex gap-1.5" aria-hidden>
      {Array.from({ length: sur }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < etape ? "gradient-secondary" : "bg-muted"}`}
        />
      ))}
    </div>
  );
}

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
    <AuthScene
      accroche="Étape 1 / 2 · Votre restaurant"
      titre="Parlez-nous de votre restaurant"
      texte="Ces informations apparaîtront sur votre vitrine à Gao."
      etape={<BarreEtape etape={1} />}
      bas={
        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/connexion" className="font-semibold text-primary underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
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
    </AuthScene>
  );
}
