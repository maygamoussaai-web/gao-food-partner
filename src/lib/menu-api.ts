import { callFunction } from "@/lib/api";

export type TypeArticle = "plat" | "boisson";

export type ArticleMenu = {
  id: string;
  nom: string;
  prix: number;
  photo_url: string | null;
  ingredients?: string | null;
  note_moyenne: number | null;
  nombre_notes: number | null;
  nombre_commandes: number | null;
  actif: boolean;
};

export type MenuData = { plats: ArticleMenu[]; boissons: ArticleMenu[] };

export const menuApi = {
  list: (token: string) => callFunction<MenuData>("restaurateur-menu", { action: "list", token }),

  create: (
    token: string,
    input: {
      type: TypeArticle;
      nom: string;
      prix: number;
      photo_url: string;
      ingredients?: string;
    },
  ) => callFunction<{ article: ArticleMenu }>("restaurateur-menu", { action: "create", token, ...input }),

  update: (
    token: string,
    input: {
      type: TypeArticle;
      id: string;
      nom?: string;
      prix?: number;
      photo_url?: string | null;
      ingredients?: string;
    },
  ) => callFunction<{ article: ArticleMenu }>("restaurateur-menu", { action: "update", token, ...input }),

  retirer: (token: string, type: TypeArticle, id: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-menu", { action: "retirer", token, type, id }),

  remettre: (token: string, type: TypeArticle, id: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-menu", { action: "remettre", token, type, id }),
};

/** Upload d'un média via l'Edge Function `restaurateur-home`. */
export function uploadMedia(
  token: string,
  base64: string,
  content_type: string,
  dossier: "logos" | "plats" | "boissons" | "promotions",
) {
  return callFunction<{ url: string }>("restaurateur-home", {
    action: "upload_media",
    token,
    base64,
    content_type,
    dossier,
  });
}
