import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/commandes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mes commandes — GAO FOOD" },
      { name: "description", content: "Suivez les commandes en cours et clôturées de votre restaurant à Gao." },
      { property: "og:title", content: "Mes commandes — GAO FOOD" },
      { property: "og:description", content: "Commandes en cours, paiements et annulations." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      titre="Mes commandes"
      texte="Le suivi détaillé des commandes arrive à la prochaine étape."
    />
  ),
});
