import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Megaphone, Store } from "lucide-react";
import { useState } from "react";

import askia from "@/assets/askia.jpg";
import { Button, ButtonLink } from "@/components/ui-kit";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const steps = [
  {
    icon: Store,
    kicker: "Visibilité",
    title: "Votre vitrine digitale à Gao",
    text: "Présentez votre restaurant, votre menu et vos boissons aux clients de Gao, avec photos et prix à jour.",
  },
  {
    icon: ClipboardList,
    kicker: "Commandes",
    title: "Vos commandes en temps réel",
    text: "Recevez les commandes, appelez l'acheteur, suivez ce qui est en cours et ce qui est clôturé.",
  },
  {
    icon: Megaphone,
    kicker: "Gestion",
    title: "Tout se pilote au même endroit",
    text: "Horaires, prix de livraison, promotions et solde : une seule application, zéro paperasse.",
  },
];

function Onboarding() {
  const [index, setIndex] = useState(0);
  const step = steps[index]!;
  const Icon = step.icon;
  const last = index === steps.length - 1;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Visuel plein cadre : Tombeau des Askia, chaleur orangée. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={askia}
          alt=""
          className="h-[58vh] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
        <div
          className="absolute inset-x-0 top-0 h-[58vh] opacity-70 mix-blend-multiply"
          style={{ backgroundImage: "var(--gradient-secondary)" }}
        />
      </div>

      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark className="text-base text-foreground" />
        <ThemeToggle />
      </header>

      <h1 className="sr-only">GAO FOOD — Interface restaurateur</h1>

      {/* Bloc d'accroche haut, sur la photo */}
      <div className="mx-auto w-full max-w-md flex-1 px-6 pt-10">
        <span className="chip">Restaurateurs de Gao</span>
        <p className="animate-rise mt-4 text-[30px] font-extrabold leading-[1.1] tracking-tight text-foreground">
          Vendez vos plats <span className="text-gradient">en ligne</span>, tous les jours.
        </p>
      </div>

      {/* Carte d'onboarding ancrée en bas */}
      <section className="mx-auto w-full max-w-md px-4 pb-8">
        <div className="card-surface animate-rise p-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ backgroundImage: "var(--gradient-secondary)" }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
                {step.kicker}
              </p>
              <h2 className="truncate text-[17px] font-bold text-foreground">{step.title}</h2>
            </div>
          </div>

          <p key={step.title} className="animate-fade mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {step.text}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {steps.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={`Étape ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-7 gradient-secondary" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>
            {!last && (
              <button
                type="button"
                onClick={() => setIndex(steps.length - 1)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Passer
              </button>
            )}
          </div>

          <div className="mt-5 space-y-2.5">
            {last ? (
              <>
                <ButtonLink to="/inscription" size="lg" className="w-full">
                  Créer mon compte
                </ButtonLink>
                <ButtonLink to="/connexion" variant="outline" size="lg" className="w-full">
                  J'ai déjà un compte
                </ButtonLink>
              </>
            ) : (
              <Button size="lg" className="w-full" onClick={() => setIndex(index + 1)}>
                Continuer <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/conditions" className="underline underline-offset-4 hover:text-foreground">
            Conditions d'utilisation et politique de confidentialité
          </Link>
        </p>
      </section>
    </div>
  );
}
