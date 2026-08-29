import { supabase } from "@/integrations/supabase/client";

/** Appel générique d'une Edge Function du projet, avec extraction propre des erreurs. */
export async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });

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
