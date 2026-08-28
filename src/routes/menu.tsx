import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/menu")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mon menu — GAO FOOD" },
      { name: "description", content: "Gérez vos plats et vos boissons proposés à la clientèle de Gao." },
      { property: "og:title", content: "Mon menu — GAO FOOD" },
      { property: "og:description", content: "Plats et boissons de votre restaurant." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      titre="Mon menu"
      texte="La gestion des plats et des boissons arrive à la prochaine étape."
    />
  ),
});
