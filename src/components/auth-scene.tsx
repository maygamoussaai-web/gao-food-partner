import type { ReactNode } from "react";

import { DancingMan } from "@/components/dancing-man";
import { OnboardingBackground } from "@/components/svg-backgrounds";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";

/**
 * Coquille des écrans d'authentification : fond SVG animé, mascotte qui danse
 * et « tire » la carte du formulaire vers le visiteur, carte en verre dépoli.
 */
export function AuthScene({
  etape,
  titre,
  texte,
  accroche,
  children,
  bas,
}: {
  /** Ex. « Étape 1/2 » — facultatif. */
  etape?: ReactNode;
  titre: string;
  texte?: string;
  /** Petite pastille au-dessus du titre. */
  accroche?: string;
  children: ReactNode;
  bas?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <OnboardingBackground />

      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark className="text-base" />
        <ThemeToggle />
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10 lg:py-10">
        {/* Mascotte : au-dessus du formulaire sur mobile, à gauche sur grand écran */}
        <div className="animate-fade flex items-end justify-center lg:justify-end">
          <DancingMan className="h-40 w-auto drop-shadow-xl sm:h-52 lg:h-[26rem]" />
        </div>

        <section className="animate-pull-card card-surface w-full justify-self-center p-5 sm:p-6">
          {accroche ? <span className="chip">{accroche}</span> : null}
          {etape ? (
            <div className="mb-1 text-xs font-semibold text-primary">{etape}</div>
          ) : null}
          <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-foreground">
            {titre}
          </h1>
          {texte ? <p className="mt-1.5 text-[15px] text-muted-foreground">{texte}</p> : null}

          <div className="mt-6">{children}</div>

          {bas ? <div className="mt-6">{bas}</div> : null}
        </section>
      </main>
    </div>
  );
}
