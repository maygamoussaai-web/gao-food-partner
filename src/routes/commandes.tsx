import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  BadgeCheck,
  ChevronDown,
  History,
  MapPin,
  PhoneCall,
  Search,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Chargement, ErreurBloc, EtatVide } from "@/components/app-shell";
import { Button, ButtonLink, SectionTitre } from "@/components/ui-kit";
import { readToken } from "@/lib/auth-api";
import { commandesApi, type Commande } from "@/lib/commandes-api";
import { formatPrix, tempsRelatif } from "@/lib/home-api";

export const Route = createFileRoute("/commandes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mes commandes — GAO FOOD" },
      {
        name: "description",
        content: "Suivez les commandes en cours et clôturées de votre restaurant à Gao.",
      },
      { property: "og:title", content: "Mes commandes — GAO FOOD" },
      { property: "og:description", content: "Commandes en cours, paiements et annulations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageCommandes,
});

function PageCommandes() {
  const token = typeof window === "undefined" ? null : readToken();
  const [recherche, setRecherche] = useState("");
  const qc = useQueryClient();

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["commandes", recherche],
    queryFn: () =>
      commandesApi.list(token as string, {
        mode: "commandes",
        ...(recherche.trim() ? { recherche: recherche.trim() } : {}),
      }),
    enabled: Boolean(token),
    refetchInterval: 45_000,
  });

  const rafraichir = () => {
    void qc.invalidateQueries({ queryKey: ["commandes"] });
    void qc.invalidateQueries({ queryKey: ["commandes-badge"] });
  };

  const enCours = data?.en_cours ?? [];
  const cloturees = data?.cloturees ?? [];

  return (
    <AppShell
      titre="Mes commandes"
      sousTitre={`${enCours.length} en cours aujourd'hui`}
      actions={
        <ButtonLink to="/historique" variant="ghost" size="icon" aria-label="Historique">
          <History className="h-5 w-5" />
        </ButtonLink>
      }
      sousHeader={
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un client, un numéro…"
              className="h-11 w-full rounded-full border border-input bg-card/80 pl-9 pr-3 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      }
    >
      {isPending ? (
        <Chargement />
      ) : error ? (
        <ErreurBloc message={(error as Error).message} onRetry={() => void refetch()} />
      ) : enCours.length === 0 && cloturees.length === 0 ? (
        <EtatVide
          icone={<BadgeCheck className="h-6 w-6" />}
          titre="Aucune commande pour l'instant"
          texte="Les nouvelles commandes de vos clients apparaîtront ici automatiquement."
        />
      ) : (
        <div className="space-y-6">
          {enCours.length > 0 && (
            <section className="space-y-3">
              <SectionTitre>En cours</SectionTitre>
              <ul className="space-y-3">
                {enCours.map((commande, i) => (
                  <li key={commande.id} className="stagger" style={{ ["--i" as string]: i }}>
                    <CarteCommande token={token} commande={commande} onChange={rafraichir} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cloturees.length > 0 && (
            <section className="space-y-3">
              <SectionTitre>Clôturées aujourd'hui</SectionTitre>
              <ul className="space-y-3">
                {cloturees.map((commande, i) => (
                  <li key={commande.id} className="stagger" style={{ ["--i" as string]: i }}>
                    <CarteCommande token={token} commande={commande} onChange={rafraichir} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}

const LIBELLES: Record<Commande["statut"], string> = {
  en_cours: "Nouvelle",
  vu: "Vue",
  payee: "Payée",
  annulee: "Annulée",
};

function Statut({ statut }: { statut: Commande["statut"] }) {
  if (statut === "payee")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-bold text-success">
        {LIBELLES.payee}
      </span>
    );
  if (statut === "annulee")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-bold text-destructive">
        {LIBELLES.annulee}
      </span>
    );
  return <span className="chip">{LIBELLES[statut]}</span>;
}

export function CarteCommande({
  token,
  commande,
  onChange,
  lectureSeule = false,
}: {
  token: string | null;
  commande: Commande;
  onChange: () => void;
  lectureSeule?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const client = commande.clients;
  const nouvelle = commande.statut === "en_cours";
  const active = commande.statut === "en_cours" || commande.statut === "vu";

  const marquerVu = useMutation({
    mutationFn: () => commandesApi.marquerVu(token as string, commande.id),
    onSuccess: onChange,
  });

  const payer = useMutation({
    mutationFn: () => commandesApi.marquerPaye(token as string, commande.id),
    onSuccess: () => {
      toast.success("Commande marquée comme payée.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const annuler = useMutation({
    mutationFn: () => commandesApi.annuler(token as string, commande.id),
    onSuccess: (res) => {
      if (res.restaurant_suspendu) {
        toast.error("Votre restaurant est suspendu : trop d'annulations aujourd'hui.");
      } else {
        toast.success(`Commande annulée (${res.annulations_aujourdhui} aujourd'hui).`);
      }
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const basculer = () => {
    const suivant = !ouvert;
    setOuvert(suivant);
    if (suivant && nouvelle && token && !lectureSeule) marquerVu.mutate();
  };

  return (
    <article
      className={`${nouvelle ? "card-highlight" : "card-surface"} overflow-hidden`}
    >
      <button
        type="button"
        onClick={basculer}
        aria-expanded={ouvert}
        className="press flex w-full items-center gap-3 p-4 text-left active:scale-[0.99]"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-secondary)" }}
        >
          {(client?.prenom ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold text-foreground">
              {client ? `${client.prenom} ${client.nom}` : "Client"}
            </p>
            <Statut statut={commande.statut} />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {commande.commande_articles.length} article
            {commande.commande_articles.length > 1 ? "s" : ""} · {tempsRelatif(commande.created_at)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-extrabold text-foreground">
            {formatPrix(commande.total_commande)}
          </p>
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${ouvert ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {ouvert && (
        <div className="animate-fade space-y-4 border-t border-border/60 px-4 py-4">
          <ul className="space-y-1.5">
            {commande.commande_articles.map((a, i) => (
              <li key={`${a.nom_article}-${i}`} className="flex items-center gap-2 text-sm">
                <span className="chip">×{a.quantite}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">{a.nom_article}</span>
                <span className="font-semibold text-muted-foreground">
                  {formatPrix(a.prix_unitaire * a.quantite)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-1 rounded-xl bg-muted/60 p-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Articles</dt>
              <dd className="font-semibold text-foreground">{formatPrix(commande.total_articles)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Livraison</dt>
              <dd className="font-semibold text-foreground">{formatPrix(commande.cout_livraison)}</dd>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-1">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="font-extrabold text-foreground">{formatPrix(commande.total_commande)}</dd>
            </div>
          </dl>

          {commande.localisation_audio_url && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Volume2 className="h-3.5 w-3.5" /> Localisation vocale du client
              </p>
              <audio
                src={commande.localisation_audio_url}
                controls
                preload="none"
                className="w-full"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {client?.numero && (
              <a
                href={`tel:${client.numero}`}
                className="press inline-flex h-10 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold text-secondary-foreground active:scale-95"
              >
                <PhoneCall className="h-4 w-4" /> {client.numero}
              </a>
            )}
            {commande.localisation_url && (
              <a
                href={commande.localisation_url}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-3 text-sm font-semibold text-foreground active:scale-95"
              >
                <MapPin className="h-4 w-4" /> Position
              </a>
            )}
          </div>

          {!lectureSeule && active && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                loading={payer.isPending}
                onClick={() => payer.mutate()}
              >
                <BadgeCheck className="h-4 w-4" /> Payée
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={annuler.isPending}
                onClick={() => {
                  if (window.confirm("Annuler cette commande ? 5 annulations par jour suspendent le restaurant.")) {
                    annuler.mutate();
                  }
                }}
              >
                <Ban className="h-4 w-4" /> Annuler
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
