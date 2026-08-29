/**
 * Brouillon d'inscription partagé entre les deux pages du parcours
 * (étape 1 : restaurant — étape 2 : restaurateur). Stocké en mémoire
 * uniquement : si l'utilisateur recharge la page en étape 2, il est
 * renvoyé à l'étape 1 pour resaisir ces quelques champs.
 */
export type BrouillonInscription = {
  restaurant_nom: string;
  restaurant_quartier: string;
  logo: File | null;
};

let brouillon: BrouillonInscription | null = null;

export function enregistrerBrouillonInscription(valeur: BrouillonInscription) {
  brouillon = valeur;
}

export function lireBrouillonInscription(): BrouillonInscription | null {
  return brouillon;
}

export function viderBrouillonInscription() {
  brouillon = null;
}
