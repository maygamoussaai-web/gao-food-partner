import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/restaurant")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mon restaurant — GAO FOOD" },
      { name: "description", content: "Paramètres de votre restaurant : logo, quartier, livraison, horaires et solde." },
      { property: "og:title", content: "Mon restaurant — GAO FOOD" },
      { property: "og:description", content: "Réglages de livraison, horaires et solde administrateur." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      titre="Mon restaurant"
      texte="Les réglages du restaurant (logo, quartier, livraison, horaires, solde admin) arrivent à la prochaine étape."
    />
  ),
});
