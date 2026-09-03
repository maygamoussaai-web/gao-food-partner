import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  BadgeCheck,
  CalendarRange,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, Chargement, ErreurBloc, EtatVide } from "@/components/app-shell";
import { Card } from "@/components/ui-kit";
import { CarteCommande } from "@/routes/commandes";
import { readToken } from "@/lib/auth-api";
import { commandesApi, type Commande } from "@/lib/commandes-api";
import { formatPrix } from "@/lib/home-api";

export const Route = createFileRoute("/historique")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Historique des commandes — GAO FOOD" },
      {
        name: "description",
        content:
          "Consultez l'historique complet des commandes payées et annulées de votre restaurant, avec filtres et tri par date.",
      },
      { property: "og:title", content: "Historique des commandes — GAO FOOD" },
      {
        property: "og:description",
        content: "Commandes clôturées, filtrées par date, par statut et par client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageHistorique,
});

type Filtre = "tout" | "payee" | "annulee";
type Tri = "recent" | "ancien";

export default function noop() {}

function PageHistorique() {
  const token = typeof window === "undefined" ? null : readToken();
  const qc = useQueryClient();
  const [recherche, setRecherche] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("tout");
  const [tri, setTri] = useState<Tri>("recent");

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

  const brutes: Commande[] = useMemo(
    () => data?.cloturees ?? data?.en_cours ?? [],
    [data],
  );

  const liste = useMemo(() => {
    const filtrees = brutes.filter((c) => (filtre === "tout" ? true : c.statut === filtre));
    return [...filtrees].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return tri === "recent" ? db - da : da - db;
    });
  }, [brutes, filtre, tri]);

  const payees = brutes.filter((c) => c.statut === "payee");
  const annulees = brutes.filter((c) => c.statut === "annulee");
  const encaisse = payees.reduce((s, c) => s + c.total_commande, 0);

  const filtreActif = Boolean(recherche || debut || fin || filtre !== "tout");

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
              aria-label="Date de début"
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card/80 px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-xs text-muted-foreground">au</span>
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              aria-label="Date de fin"
              className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card/80 px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 rounded-full bg-muted p-1">
              {(
                [
                  ["tout", `Tout (${brutes.length})`],
                  ["payee", `Payées (${payees.length})`],
                  ["annulee", `Annulées (${annulees.length})`],
                ] as const
              ).map(([valeur, label]) => (
                <button
                  key={valeur}
                  type="button"
                  onClick={() => setFiltre(valeur)}
                  className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all duration-200 ${
                    filtre === valeur
                      ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTri((t) => (t === "recent" ? "ancien" : "recent"))}
              aria-label={tri === "recent" ? "Trier du plus ancien" : "Trier du plus récent"}
              className="press flex h-10 items-center gap-1.5 rounded-xl border border-input bg-card/80 px-3 text-xs font-semibold text-foreground active:scale-95"
            >
              {tri === "recent" ? (
                <ArrowDownWideNarrow className="h-4 w-4 text-secondary-foreground" />
              ) : (
                <ArrowUpWideNarrow className="h-4 w-4 text-secondary-foreground" />
              )}
              {tri === "recent" ? "Récentes" : "Anciennes"}
            </button>
          </div>
        </div>
      }
    >
      {isPending ? (
        <Chargement lignes={5} />
      ) : error ? (
        <ErreurBloc message={(error as Error).message} onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-5">
          <div className="animate-rise card-highlight p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
                style={{ backgroundImage: "var(--gradient-secondary)" }}
              >
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground">
                  Total encaissé
                </p>
                <p className="text-2xl font-extrabold leading-tight text-foreground">
                  {formatPrix(encaisse)}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Mini
                icone={<BadgeCheck className="h-4 w-4" />}
                valeur={String(payees.length)}
                label="payées"
              />
              <Mini
                icone={<XCircle className="h-4 w-4" />}
                valeur={String(annulees.length)}
                label="annulées"
                danger
              />
            </div>
          </div>

          {liste.length === 0 ? (
            <EtatVide
              icone={<CalendarRange className="h-6 w-6" />}
              titre={
                filtreActif ? "Aucune commande pour ces filtres" : "Aucune commande clôturée"
              }
              texte={
                filtreActif
                  ? "Modifiez les dates, le statut ou la recherche pour voir d'autres commandes."
                  : "Les commandes payées ou annulées apparaîtront ici."
              }
            />
          ) : (
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
          )}
        </div>
      )}
    </AppShell>
  );
}

function Mini({
  icone,
  valeur,
  label,
  danger = false,
}: {
  icone: React.ReactNode;
  valeur: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 backdrop-blur">
      <span className={danger ? "text-destructive" : "text-primary"}>{icone}</span>
      <span className="text-sm font-extrabold text-foreground">{valeur}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
