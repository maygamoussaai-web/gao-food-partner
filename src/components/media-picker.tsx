import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  compresserImage,
  estImage,
  formatTaille,
  TAILLE_MAX_LABEL,
  TAILLE_MAX_OCTETS,
} from "@/lib/image";

/**
 * Sélecteur de photo (ou photo+vidéo) avec aperçu immédiat.
 * Sur mobile, le <input type="file"> natif propose déjà le choix
 * "Appareil photo" ou "Galerie" — inutile de dupliquer ce choix en JS.
 */
export function MediaPicker({
  value,
  onChange,
  accept = "image/*",
  label = "Photo",
  hint,
  rond = false,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  hint?: string;
  /** Aperçu rond (ex. logo) plutôt que rectangulaire (ex. plat, promo). */
  rond?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const estVideo = value?.type.startsWith("video/");

  async function choisir(file: File | null) {
    setErreur(null);
    if (!file) {
      onChange(null);
      return;
    }
    if (file.size > TAILLE_MAX_OCTETS) {
      setErreur(
        `Fichier trop lourd (${formatTaille(file.size)}). Maximum autorisé : ${TAILLE_MAX_LABEL}.`,
      );
      onChange(null);
      return;
    }
    if (!estImage(file)) {
      onChange(file);
      return;
    }
    setTraitement(true);
    try {
      onChange(await compresserImage(file));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Image illisible.");
      onChange(null);
    } finally {
      setTraitement(false);
    }
  }

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <div
          className={`relative overflow-hidden border border-border bg-muted ${
            rond ? "h-24 w-24 rounded-full" : "aspect-video w-full rounded-lg"
          }`}
        >
          {estVideo ? (
            <video src={previewUrl} className="h-full w-full object-cover" muted playsInline controls />
          ) : (
            <img src={previewUrl} alt="Aperçu" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/50 to-transparent p-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Retirer"
              className="rounded-full bg-background/90 p-1.5 text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-input bg-card text-muted-foreground transition-colors hover:border-ring hover:text-foreground ${
            rond ? "h-24 w-24 rounded-full" : "aspect-video rounded-lg"
          }`}
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs">Caméra ou galerie</span>
        </button>
      )}

      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
