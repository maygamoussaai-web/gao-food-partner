import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Search } from "lucide-react";
import { useState } from "react";

import { AppShell, Chargement, ErreurBloc, EtatVide } from "@/components/app-shell";
import { CarteCommande } from "@/routes/commandes";
import { readToken } from "@/lib/auth-api";
import { commandesApi } from "@/lib/commandes-api";
import { formatPrix } from "@/lib/home-api";

export const Route = createFileRoute("/historique")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Historique des commandes — GAO FOOD" },
      {
        name: "description",
        content: "Consultez l'historique complet des commandes payées et annulées de votre restaurant.",
      },
      { property: "og:title", content: "Historique des commandes — GAO FOOD" },
      { property: "og:description", content: "Commandes clôturées, filtrées par date et par client." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageHistorique,
});

function PageHistorique() {
  const token = typeof window === "undefined" ? null : readToken();
  const qc = useQueryClient();
  const [recherche, setRecherche] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["historique", recherche, debut, fin],
    queryFn: () =>
      commandesApi.list(token as string, {
        mode: "historique",
        ...(recherche.trim() ? { recherche: recherche.trim() } : {}),
        ...(debut ? { date_debut: debut } : {}),
        ...(fin ? { date_fin: fin } : {}),
      }),
    enabled: Boolean(token),
  });

  const liste = data?.cloturees ?? data?.en_cours ?? [];
  const total = liste
    .filter((c) => c.statut === "payee")
    .reduce((s, c) => s + c.total_commande, 0);

  return (
    <AppShell
      titre="Historique"
      sousTitre="Commandes payées et annulées"
      retour
      sousHeader={
        <div className="mx-auto max-w-3xl space-y-2 px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un client…"
              className="h-11 w-full rounded-full border border-input bg-card/80 pl-9 pr-3 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 shrink-0 text-secondary-foreground" />
            <input
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card/80 px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-xs text-muted-foreground">au</span>
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card/80 px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      }
    >
      {isPending ? (
        <Chargement />
      ) : error ? (
        <ErreurBloc message={(error as Error).message} onRetry={() => void refetch()} />
      ) : liste.length === 0 ? (
        <EtatVide
          icone={<CalendarRange className="h-6 w-6" />}
          titre="Aucune commande sur cette période"
          texte="Modifiez les dates ou la recherche pour voir d'autres commandes."
        />
      ) : (
        <div className="space-y-4">
          <div className="card-highlight flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground">
                Total encaissé
              </p>
              <p className="text-xl font-extrabold text-foreground">{formatPrix(total)}</p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              {liste.length} commande{liste.length > 1 ? "s" : ""}
            </p>
          </div>

          <ul className="space-y-3">
            {liste.map((commande, i) => (
              <li key={commande.id} className="stagger" style={{ ["--i" as string]: i }}>
                <CarteCommande
                  token={token}
                  commande={commande}
                  lectureSeule
                  onChange={() => void qc.invalidateQueries({ queryKey: ["historique"] })}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
