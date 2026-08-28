# Gao Food Partner

Crée l'application "GAO FOOD — Interface Restaurateur", une PWA responsive (mobile, tablette, desktop) en français, connectée à un projet Supabase EXISTANT (project_id: wqyebuohgyldvpaktdts). N'active PAS le provisioning automatique d'une nouvelle base — utilise le connecteur Supabase pour te lier à ce projet existant. Les tables déjà en place : restaurateurs, clients, restaurants, plats, boissons, promotions, commandes, commande_articles, historique_paiements_solde, parametres_admin. RLS est activée et bloque tout accès direct sauf lecture publique des restaurants/plats/boissons/promotions actifs — toute écriture (inscription, connexion, gestion commandes, etc.) doit passer par des Edge Functions Supabase que tu créeras, car l'authentification est custom (numéro de téléphone + mot de passe haché avec pgcrypto/bcrypt, PAS Supabase Auth classique).

RÈGLE IMPORTANTE : ne prends aucune initiative sur la LOGIQUE MÉTIER (règles de gestion, calculs, statuts, contraintes) — respecte strictement ce qui est décrit ci-dessous. Sur le VISUEL uniquement, tu peux proposer des améliorations mais reste sobre, jamais "cliché IA".

=== DESIGN SYSTEM ===
Mode clair : primaire blanc, secondaire bleu clair, fond avec photo discrète (overlay) du Tombeau des Askia de Gao.
Mode sombre : primaire noir, secondaire bleu, tertiaire blanc.
Inspiration : sobriété et efficacité de WhatsApp (listes, densité d'info, simplicité), pas de dégradés inutiles, pas de mélange de couleurs gratuit. Détails visuels soignés dignes d'apps comme WhatsApp/Instagram/TikTok mais appliqués avec parcimonie. Coins arrondis discrets, hiérarchie typographique claire, micro-interactions subtiles (pas d'animations tape-à-l'œil).
Toggle clair/sombre accessible. Toi seul définis boutons, loaders, pages d'erreur, messages de succès/erreur, icônes — reste cohérent et minimaliste.

=== ONBOARDING ===
2-3 écrans d'intro présentant GAO FOOD aux restaurateurs (vitrine digitale des restaurants de Gao, commandes en ligne, gestion simplifiée).

=== AUTHENTIFICATION ===
Inscription en 2 pages :
1) Nom du restaurant, logo (optionnel), quartier.
2) Prénom, nom, numéro de téléphone, mot de passe (champ avec icône œil ouvert/barré pour afficher/masquer).
En bas : case "En vous inscrivant vous acceptez nos conditions, nos politiques de sécurité et de confidentialité" — ce texte est un lien vers une page CGU/Politique de confidentialité dédiée aux restaurateurs (génère un contenu complet et cohérent avec la logique de l'app : collecte de données, commandes, solde dû à l'admin, suspension, résiliation).
Connexion : numéro + mot de passe (œil). "Mot de passe oublié" → réinitialisation par numéro de téléphone (flux avec code de vérification simulé si pas de SMS provider). Session persistante sécurisée (éviter reconnexion à chaque ouverture) via stockage sécurisé du token, sans faille.

=== ACCUEIL ===
En haut à droite : icônes accès compte/restaurant.
Message d'accueil dynamique selon l'heure : matin/après-midi "Bonjour, comment allez-vous ? 👋 M./Mme [nom restaurateur]", soir "Bonsoir, comment s'est passée votre journée ? 🌃". Date et heure affichées.
Section "Commandes récentes" : 5 dernières commandes (articles, prix, date/heure).
Section "Mes plats" (nombre total de plats au menu) : plats les plus commandés.
Section "Promouvoir votre restaurant" : création de promo façon story WhatsApp (photo ou vidéo + description + lien optionnel vers un plat ou une boisson) affichée ensuite sur la vitrine client.
Section "Mes boissons" : identique aux plats.
Raccourcis "Consulter vos commandes" et "Consulter votre menu".
Tu peux enrichir cette page (stats rapides, etc.) tant que ça reste cohérent et sobre.

=== GESTION COMPTE / RESTAURANT ===
Deux pages :
1) Compte restaurateur : infos modifiables (prénom, nom, numéro), changement de mot de passe (ancien mot de passe requis + nouveau + confirmation).
2) Restaurant : nom (modifiable), logo (modifiable/supprimable), quartier (modifiable), prix de livraison en FCFA (max 1000 — afficher un message expliquant qu'un prix et délai bas augmentent les chances d'être choisi), horaires d'ouverture (créneau — toute commande hors créneau est refusée avec message explicite), délai de livraison min/max en minutes (max 3h soit 180 min), solde dû à l'admin (lecture seule, cumule à chaque commande marquée payée + chaque promotion), bouton "Payer l'admin" qui ouvre WhatsApp vers +223 60673302 avec message pré-rempli.
Suppression du restaurant : confirmation par mot de passe puis saisie du nom exact du restaurant. Bloquée si solde_admin > 0 (afficher pourquoi). Suppression définitive et irréversible (restaurant + restaurateur + toutes données liées).

=== MENU ===
Deux sous-pages : Plats et Boissons.
Liste : photo, nom, prix. Clic → fiche détail : nom (modifiable), photo (modifiable/supprimable), prix (modifiable), description/ingrédients (optionnel, plats uniquement — pas pour boissons), note moyenne (/5), nombre de fois commandé, bouton retirer du menu.
Bouton "Ajouter un plat/boisson" → formulaire (nom, prix, photo, ingrédients pour les plats) — tous les champs obligatoires.

=== COMMANDES ===
Affiche : 10 dernières commandes clôturées (payées/annulées) + toutes les commandes en cours. Filtrable par date, barre de recherche (nom du plat, nom ou numéro de l'acheteur).
Cartes extensibles/rétractables. Chaque carte : articles + quantités + total, bouton "Appeler l'acheteur" (tel:), fiche acheteur (prénom, nom, numéro), localisation (message vocal ou lien Google Maps selon la méthode choisie par le client).
Statut : en_cours → passe automatiquement à "vu" à l'ouverture par le restaurateur. Boutons "Marquer payé" (préciser : seulement après réception réelle de l'argent) et "Annuler" (préciser : maximum 5 annulations par jour, au-delà suspension du restaurant). Badge avec nombre de commandes non lues sur l'onglet "Commandes" dans la nav bar.

=== HISTORIQUE ===
Commandes clôturées uniquement (payées/annulées), horodatées, cartes compactes, filtrable par date + recherche mot-clé.

=== NOTIFICATIONS ===
Notification au restaurateur à chaque nouvelle commande et à chaque annulation par un client. (Implémente via Supabase Realtime + notifications in-app ; si push natif impossible en PWA web, prévois au minimum un centre de notifications in-app avec badge.)

Construis d'abord l'authentification + les Edge Functions nécessaires (inscription, connexion, reset mot de passe) avant le reste, en respectant scrupuleusement le schéma de base existant. Dis-moi si un point de logique métier te semble incomplet plutôt que d'inventer une règle.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2746216f-0b0a-4182-9ae9-e0f9fb89295a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
