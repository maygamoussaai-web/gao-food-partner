import { supabase } from "@/integrations/supabase/client";

export type CommandeArticle = {
  nom_article: string;
  quantite: number;
  prix_unitaire: number;
};

export type CommandeRecente = {
  id: string;
  statut: string;
  total_commande: number;
  created_at: string;
  commande_articles: CommandeArticle[];
};

export type ArticlePopulaire = {
  id: string;
  nom: string;
  prix: number;
  photo_url: string | null;
  nombre_commandes: number;
  note_moyenne: number | null;
};

export type HomeData = {
  restaurateur: { prenom: string; nom: string; numero: string };
  restaurant: Record<string, unknown> & { nom?: string; quartier?: string; statut?: string; motif_suspension?: string | null };
  commandes_recentes: CommandeRecente[];
  nombre_plats: number;
  plats_populaires: ArticlePopulaire[];
  nombre_boissons: number;
  boissons_populaires: ArticlePopulaire[];
  commandes_non_lues: number;
};

type HomeAction =
  | { action: "get_home"; token: string }
  | { action: "upload_media"; token: string; base64: string; content_type: string; dossier: "logos" | "plats" | "boissons" | "promotions" }
  | {
      action: "create_promotion";
      token: string;
      media_url: string;
      type_media: "image" | "video";
      description?: string;
      plat_id?: string;
      boisson_id?: string;
      expires_at?: string;
    }
  | { action: "desactiver_promotion"; token: string; promotion_id: string };

async function callHome<T>(body: HomeAction): Promise<T> {
  const { data, error } = await supabase.functions.invoke("restaurateur-home", { body });

  if (error) {
    let message = error.message;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.text === "function") {
      try {
        const raw = await ctx.text();
        const parsed = JSON.parse(raw) as { error?: string; message?: string };
        message = parsed.error ?? parsed.message ?? raw ?? message;
      } catch {
        /* réponse non JSON */
      }
    }
    throw new Error(message || "Erreur de connexion au serveur.");
  }

  const payload = data as (T & { error?: string }) | null;
  if (!payload) throw new Error("Réponse vide du serveur.");
  if (payload.error) throw new Error(payload.error);
  return payload;
}

export const homeApi = {
  getHome: (token: string) => callHome<HomeData>({ action: "get_home", token }),
  uploadMedia: (token: string, base64: string, content_type: string) =>
    callHome<{ url: string }>({
      action: "upload_media",
      token,
      base64,
      content_type,
      dossier: "promotions",
    }),
  createPromotion: (
    token: string,
    input: {
      media_url: string;
      type_media: "image" | "video";
      description?: string;
      plat_id?: string;
      boisson_id?: string;
    },
  ) => callHome<{ promotion: unknown }>({ action: "create_promotion", token, ...input }),
};

/** Convertit un fichier en base64 brut (sans le préfixe data:...). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

const FCFA = new Intl.NumberFormat("fr-FR");

export function formatPrix(valeur: number | null | undefined) {
  if (valeur == null) return "—";
  return `${FCFA.format(valeur)} FCFA`;
}

export function tempsRelatif(iso: string) {
  const date = new Date(iso);
  const diff = Math.round((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(diff)) return "";
  if (diff < 60) return "à l'instant";
  const minutes = Math.round(diff / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours < 7) return `il y a ${jours} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
