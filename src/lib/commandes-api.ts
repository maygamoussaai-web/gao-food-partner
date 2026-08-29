import { callFunction } from "@/lib/api";

export type CommandeArticleDetail = {
  nom_article: string;
  quantite: number;
  prix_unitaire: number;
  note_donnee: number | null;
};

export type ClientCommande = { prenom: string; nom: string; numero: string };

export type Commande = {
  id: string;
  statut: "en_cours" | "vu" | "payee" | "annulee";
  total_articles: number;
  cout_livraison: number;
  total_commande: number;
  created_at: string;
  localisation_url: string | null;
  localisation_audio_url: string | null;
  methode_localisation: "audio" | "position" | null;
  commande_articles: CommandeArticleDetail[];
  clients: ClientCommande | null;
};

export type ListeCommandes = { en_cours?: Commande[]; cloturees?: Commande[] };

export const commandesApi = {
  list: (
    token: string,
    input: {
      mode: "commandes" | "historique";
      recherche?: string;
      date_debut?: string;
      date_fin?: string;
    },
  ) => callFunction<ListeCommandes>("restaurateur-commandes", { action: "list", token, ...input }),

  marquerVu: (token: string, commande_id: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-commandes", {
      action: "marquer_vu",
      token,
      commande_id,
    }),

  marquerPaye: (token: string, commande_id: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-commandes", {
      action: "marquer_paye",
      token,
      commande_id,
    }),

  annuler: (token: string, commande_id: string) =>
    callFunction<{ ok: boolean; restaurant_suspendu: boolean; annulations_aujourdhui: number }>(
      "restaurateur-commandes",
      { action: "annuler", token, commande_id },
    ),
};
