/**
 * Compression d'image côté client.
 *
 * Objectif : réduire fortement le poids sans dégrader visiblement le rendu.
 * On conserve une définition largement supérieure à la taille d'affichage
 * (jusqu'à 1600 px sur le grand côté) et une qualité JPEG élevée, en ne
 * baissant la qualité que progressivement si le fichier reste trop lourd.
 */

/** Taille maximale acceptée pour un fichier source (3 Mo). */
export const TAILLE_MAX_OCTETS = 3 * 1024 * 1024;
export const TAILLE_MAX_LABEL = "3 Mo";

/** Poids visé après compression. */
const CIBLE_OCTETS = 700 * 1024;
const COTE_MAX = 1600;

export function estImage(file: File) {
  return file.type.startsWith("image/");
}

export function formatTaille(octets: number) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

function chargerImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Compresse une image en préservant sa netteté.
 * Les fichiers non-image (vidéos) sont renvoyés tels quels.
 * Lève une erreur si le fichier source dépasse 3 Mo.
 */
export async function compresserImage(file: File): Promise<File> {
  if (file.size > TAILLE_MAX_OCTETS) {
    throw new Error(
      `Image trop lourde (${formatTaille(file.size)}). La taille maximale est de ${TAILLE_MAX_LABEL}.`,
    );
  }
  if (!estImage(file) || file.type === "image/gif") return file;

  try {
    const img = await chargerImage(file);
    const ratio = Math.min(1, COTE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const largeur = Math.round(img.naturalWidth * ratio);
    const hauteur = Math.round(img.naturalHeight * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Fond blanc : évite le noir sur les PNG transparents convertis en JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, largeur, hauteur);
    ctx.drawImage(img, 0, 0, largeur, hauteur);

    let meilleur: Blob | null = null;
    for (const qualite of [0.92, 0.86, 0.8, 0.72]) {
      const blob = await toBlob(canvas, "image/jpeg", qualite);
      if (!blob) break;
      meilleur = blob;
      if (blob.size <= CIBLE_OCTETS) break;
    }

    if (!meilleur || meilleur.size >= file.size) return file;

    const nom = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([meilleur], nom, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // En cas d'échec du canvas, on garde le fichier d'origine.
    return file;
  }
}
