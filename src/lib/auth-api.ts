import { supabase } from "@/integrations/supabase/client";

export type Restaurateur = {
  id: string;
  prenom: string;
  nom: string;
  numero: string;
};

export type Restaurant = {
  id: string;
  nom: string;
  quartier: string;
  logo_url: string | null;
  statut: string;
  motif_suspension?: string | null;
};

export type AuthPayload = {
  token: string;
  restaurateur: Restaurateur;
  restaurant: Restaurant;
};

type Action =
  | {
      action: "register";
      prenom: string;
      nom: string;
      numero: string;
      mot_de_passe: string;
      restaurant_nom: string;
      restaurant_quartier: string;
      restaurant_logo_base64?: string;
      restaurant_logo_content_type?: string;
    }
  | { action: "login"; numero: string; mot_de_passe: string }
  | { action: "session"; token: string }
  | { action: "reset_request"; numero: string }
  | { action: "reset_confirm"; numero: string; code: string; nouveau_mot_de_passe: string };

/** Appelle l'Edge Function `auth-restaurateur` déployée sur le projet Supabase. */
async function callAuth<T>(body: Action): Promise<T> {
  const { data, error } = await supabase.functions.invoke("auth-restaurateur", { body });

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

export const authApi = {
  register: (input: Omit<Extract<Action, { action: "register" }>, "action">) =>
    callAuth<AuthPayload>({ action: "register", ...input }),
  login: (numero: string, mot_de_passe: string) =>
    callAuth<AuthPayload>({ action: "login", numero, mot_de_passe }),
  session: (token: string) =>
    callAuth<{ restaurateur: Restaurateur; restaurant: Restaurant }>({ action: "session", token }),
  resetRequest: (numero: string) =>
    callAuth<{ code_debug?: string }>({ action: "reset_request", numero }),
  resetConfirm: (numero: string, code: string, nouveau_mot_de_passe: string) =>
    callAuth<{ ok?: boolean }>({ action: "reset_confirm", numero, code, nouveau_mot_de_passe }),
};

const TOKEN_KEY = "gaofood-token";

export function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* stockage indisponible */
  }
}

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* stockage indisponible */
  }
}
