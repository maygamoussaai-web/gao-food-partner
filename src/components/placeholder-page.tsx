import { ArrowLeft } from "lucide-react";

import { ButtonLink, Card } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";

export function PlaceholderPage({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <Wordmark className="text-sm" />
        <ButtonLink to="/tableau-de-bord" variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </ButtonLink>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground">{titre}</h1>
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">{texte}</p>
        </Card>
      </main>
    </div>
  );
}
