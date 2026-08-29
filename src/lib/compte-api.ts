import { callFunction } from "@/lib/api";

export type RestaurantComplet = {
  id: string;
  nom: string;
  logo_url: string | null;
  quartier: string;
  prix_livraison: number;
  horaire_ouverture: string;
  horaire_fermeture: string;
  delai_livraison_min_min: number;
  delai_livraison_max_min: number;
  solde_admin: number;
  statut: string;
  motif_suspension: string | null;
};

export const compteApi = {
  updateProfil: (
    token: string,
    input: { prenom?: string; nom?: string; numero?: string },
  ) =>
    callFunction<{ restaurateur: { prenom: string; nom: string; numero: string } }>(
      "restaurateur-compte",
      { action: "update_profil", token, ...input },
    ),

  changerMotDePasse: (token: string, ancien: string, nouveau: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-compte", {
      action: "changer_mot_de_passe",
      token,
      ancien,
      nouveau,
    }),

  updateRestaurant: (
    token: string,
    input: {
      nom?: string;
      logo_url?: string;
      quartier?: string;
      prix_livraison?: number;
      horaire_ouverture?: string;
      horaire_fermeture?: string;
      delai_livraison_min_min?: number;
      delai_livraison_max_min?: number;
    },
  ) =>
    callFunction<{ restaurant: RestaurantComplet }>("restaurateur-compte", {
      action: "update_restaurant",
      token,
      ...input,
    }),

  retirerLogo: (token: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-compte", { action: "retirer_logo", token }),

  supprimerRestaurant: (token: string, mot_de_passe: string, nom_confirmation: string) =>
    callFunction<{ ok?: boolean }>("restaurateur-compte", {
      action: "supprimer_restaurant",
      token,
      mot_de_passe,
      nom_confirmation,
    }),
};
