import { useMemo, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Field, FormError, Input } from "@/components/form-field";
import { MediaPicker } from "@/components/media-picker";
import { Button } from "@/components/ui-kit";
import { fileToBase64, homeApi, type ArticlePopulaire } from "@/lib/home-api";

type Cible = { type: "plat" | "boisson"; article: ArticlePopulaire };

export function PromotionDialog({
  token,
  plats,
  boissons,
  onClose,
  onCreated,
}: {
  token: string;
  plats: ArticlePopulaire[];
  boissons: ArticlePopulaire[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fichier, setFichier] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [recherche, setRecherche] = useState("");
  const [cible, setCible] = useState<Cible | null>(null);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return [] as Cible[];
    const tous: Cible[] = [
      ...plats.map((article) => ({ type: "plat" as const, article })),
      ...boissons.map((article) => ({ type: "boisson" as const, article })),
    ];
    return tous.filter((c) => c.article.nom.toLowerCase().includes(q)).slice(0, 5);
  }, [recherche, plats, boissons]);

  async function soumettre(event: React.FormEvent) {
    event.preventDefault();
    setErreur("");
    if (!fichier) {
      setErreur("Ajoutez une photo ou une vidéo.");
      return;
    }
    const estVideo = fichier.type.startsWith("video/");
    if (!estVideo && !fichier.type.startsWith("image/")) {
      setErreur("Format non pris en charge : choisissez une image ou une vidéo.");
      return;
    }

    setEnvoi(true);
    try {
      const base64 = await fileToBase64(fichier);
      const { url } = await homeApi.uploadMedia(token, base64, fichier.type);
      await homeApi.createPromotion(token, {
        media_url: url,
        type_media: estVideo ? "video" : "image",
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(cible?.type === "plat" ? { plat_id: cible.article.id } : {}),
        ...(cible?.type === "boisson" ? { boisson_id: cible.article.id } : {}),
      });
      toast.success("Promotion publiée sur votre vitrine.");
      onCreated();
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Publication impossible.";
      setErreur(message);
      toast.error(message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nouvelle promotion"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Nouvelle promotion</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={soumettre}>
          <MediaPicker
            label="Photo ou vidéo"
            accept="image/*,video/*"
            value={fichier}
            onChange={setFichier}
            hint="Visible sur votre vitrine, façon story."
          />

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex. Menu du jour à petit prix…"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <Field label="Lier un plat ou une boisson (optionnel)">
            {cible ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2">
                <span className="text-sm text-foreground">
                  {cible.article.nom}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {cible.type === "plat" ? "Plat" : "Boisson"}
                  </span>
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCible(null)}>
                  Retirer
                </Button>
              </div>
            ) : (
              <>
                <Input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher dans vos articles"
                />
                {resultats.length > 0 && (
                  <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {resultats.map((r) => (
                      <li key={`${r.type}-${r.article.id}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setCible(r);
                            setRecherche("");
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        >
                          {r.article.nom}
                          <span className="text-xs text-muted-foreground">
                            {r.type === "plat" ? "Plat" : "Boisson"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </Field>

          <FormError>{erreur}</FormError>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={envoi}>
              {envoi ? "Publication…" : "Publier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
