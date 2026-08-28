import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, Megaphone, Store } from "lucide-react";
import { useState } from "react";

import { AskiaBackground } from "@/components/askia-background";
import { Button, ButtonLink } from "@/components/ui-kit";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GAO FOOD — Espace restaurateur" },
      {
        name: "description",
        content:
          "GAO FOOD : la vitrine digitale des restaurants de Gao. Recevez vos commandes en ligne et gérez votre menu simplement.",
      },
      { property: "og:title", content: "GAO FOOD — Espace restaurateur" },
      {
        property: "og:description",
        content:
          "Vitrine digitale, commandes en ligne et gestion simplifiée pour les restaurants de Gao.",
      },
    ],
  }),
  component: Onboarding,
});

const steps = [
  {
    icon: Store,
    title: "Votre vitrine digitale à Gao",
    text: "Présentez votre restaurant, votre menu et vos boissons aux clients de Gao, avec photos et prix à jour.",
  },
  {
    icon: ClipboardList,
    title: "Vos commandes en ligne",
    text: "Recevez les commandes en temps réel, appelez l'acheteur, suivez ce qui est en cours et ce qui est clôturé.",
  },
  {
    icon: Megaphone,
    title: "Une gestion simplifiée",
    text: "Horaires, prix de livraison, promotions et solde : tout se gère depuis une seule application.",
  },
];

function Onboarding() {
  const [index, setIndex] = useState(0);
  const step = steps[index]!;
  const Icon = step.icon;
  const last = index === steps.length - 1;

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AskiaBackground />

      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark className="text-sm text-foreground" />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <h1 className="sr-only">GAO FOOD — Interface restaurateur</h1>

        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-6 w-6" />
        </div>

        <h2 className="mt-6 text-2xl font-semibold leading-snug text-foreground">
          {step.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>

        <div className="mt-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="mt-10 space-y-3">
          {last ? (
            <>
              <ButtonLink to="/conditions" size="lg" className="w-full">
                Commencer
              </ButtonLink>
              <p className="text-center text-xs text-muted-foreground">
                L'inscription et la connexion seront activées dès la connexion à votre base
                de données.
              </p>
            </>
          ) : (
            <Button size="lg" className="w-full" onClick={() => setIndex(index + 1)}>
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {!last && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setIndex(steps.length - 1)}
            >
              Passer
            </Button>
          )}
        </div>
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-muted-foreground">
        <Link to="/conditions" className="underline underline-offset-4 hover:text-foreground">
          Conditions d'utilisation et politique de confidentialité
        </Link>
      </footer>
    </div>
  );
}
