import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/compte")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mon compte — GAO FOOD" },
      { name: "description", content: "Gérez vos informations personnelles de restaurateur sur GAO FOOD." },
      { property: "og:title", content: "Mon compte — GAO FOOD" },
      { property: "og:description", content: "Informations personnelles et mot de passe du restaurateur." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      titre="Mon compte"
      texte="La gestion de vos informations personnelles et de votre mot de passe arrive à la prochaine étape."
    />
  ),
});
