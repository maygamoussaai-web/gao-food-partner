import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  ClipboardList,
  LogOut,
  Megaphone,
  Star,
  Store,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, Chargement, ErreurBloc, EtatVide } from "@/components/app-shell";
import { Clock } from "@/components/clock";
import { PromotionDialog } from "@/components/promotion-dialog";
import { Button, ButtonLink, Card, SectionTitre } from "@/components/ui-kit";
import { useAuth } from "@/hooks/use-auth";
import { readToken } from "@/lib/auth-api";
import {
  formatPrix,
  homeApi,
  tempsRelatif,
  type ArticlePopulaire,
  type CommandeRecente,
} from "@/lib/home-api";

export const Route = createFileRoute("/tableau-de-bord")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tableau de bord — GAO FOOD" },
      {
        name: "description",
        content:
          "Vue d'ensemble de votre restaurant sur GAO FOOD : commandes, menu, promotions et solde.",
      },
      { property: "og:title", content: "Tableau de bord — GAO FOOD" },
      {
        property: "og:description",
        content: "Pilotez votre restaurant de Gao depuis un seul écran.",
      },
    ],
  }),
  component: TableauDeBord,
});

function useHorloge() {
  const [maintenant, setMaintenant] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return maintenant;
}

/* --------------------------- Bloc de bienvenue --------------------------- */

function CarteBienvenue({
  salutation,
  dateTexte,
  suspendu,
  motif,
}: {
  salutation: string;
  dateTexte: string;
  suspendu: boolean;
  motif?: string | null;
}) {
  return (
    <Card highlight className="animate-rise overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[19px] font-bold leading-snug text-foreground">{salutation}</h2>
          <p className="mt-1 text-sm capitalize text-muted-foreground">{dateTexte}</p>
        </div>
        <Clock className="shrink-0" />
      </div>

      {suspendu && (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Restaurant suspendu. {motif}
        </p>
      )}
    </Card>
  );
}

/* ------------------------------ Raccourcis ------------------------------- */

function RaccourciCarte({
  to,
  hash,
  icone,
  titre,
  sousTitre,
  badge,
  degrade,
}: {
  to: string;
  hash?: string;
  icone: React.ReactNode;
  titre: string;
  sousTitre: string;
  badge?: number;
  degrade: "primary" | "secondary" | "night";
}) {
  const styleDegrade = { backgroundImage: `var(--gradient-${degrade})` } as const;
  return (
    <ButtonLink
      to={to}
      {...(hash ? { hash } : {})}
      variant="outline"
      className="h-auto flex-col items-start gap-3 p-4 text-left"
    >
      <div className="flex w-full items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
          style={styleDegrade}
        >
          {icone}
        </div>
        {badge != null && badge > 0 && (
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[15px] font-bold leading-tight text-foreground">{titre}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sousTitre}</p>
      </div>
    </ButtonLink>
  );
}

/* ---------------------------- Commandes récentes -------------------------- */

function CarteCommande({ commande }: { commande: CommandeRecente }) {
  const date = new Date(commande.created_at);
  return (
    <div className="stagger card-surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <ul className="min-w-0 space-y-0.5 text-sm text-foreground">
          {commande.commande_articles?.map((article, i) => (
            <li key={`${article.nom_article}-${i}`} className="truncate">
              {article.nom_article} × {article.quantite}
            </li>
          ))}
        </ul>
        <span className="shrink-0 text-sm font-semibold text-foreground">
          {formatPrix(commande.total_commande)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{tempsRelatif(commande.created_at)}</span>
        <span aria-hidden>•</span>
        <span>
          {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}{" "}
          {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span aria-hidden>•</span>
        <span className="capitalize">{commande.statut?.replace(/_/g, " ")}</span>
      </div>
    </div>
  );
}

/* ------------------------- Grille d'articles (visuel) --------------------- */

function GrilleArticles({ articles }: { articles: ArticlePopulaire[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {articles.map((article, i) => (
        <div
          key={article.id}
          className="stagger card-surface overflow-hidden"
          style={{ ["--i" as string]: i }}
        >
          <div className="flex justify-center pt-3">
            <PhotoRonde
              src={article.photo_url}
              alt={article.nom}
              taille="h-16 w-16"
              fallback={<UtensilsCrossed className="h-5 w-5" />}
            />
          </div>
          <div className="p-2.5 text-center">
            <p className="truncate text-[13px] font-semibold text-foreground">{article.nom}</p>
            <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">{formatPrix(article.prix)}</span>
              {Number(article.note_moyenne) > 0 && (
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-current" />
                  {Number(article.note_moyenne).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

function TableauDeBord() {
  const navigate = useNavigate();
  const { restaurateur, signOut } = useAuth();
  const maintenant = useHorloge();
  const [promoOuverte, setPromoOuverte] = useState(false);
  const token = typeof window === "undefined" ? null : readToken();

  const home = useQuery({
    queryKey: ["home", token],
    queryFn: () => homeApi.getHome(token as string),
    enabled: Boolean(token) && Boolean(restaurateur),
  });

  const data = home.data;
  const heure = maintenant.getHours();
  const jour = heure >= 5 && heure < 18;
  const nom = `${data?.restaurateur.prenom ?? restaurateur?.prenom ?? ""} ${
    data?.restaurateur.nom ?? restaurateur?.nom ?? ""
  }`.trim();
  const salutation = jour
    ? `Bonjour, comment allez-vous ? 👋 M./Mme ${nom}`
    : `Bonsoir, comment s'est passée votre journée ? 🌃 M./Mme ${nom}`;
  const nonLues = data?.commandes_non_lues ?? 0;

  return (
    <AppShell
      titre="Accueil"
      actions={
        <>
          <ButtonLink to="/compte" variant="ghost" size="icon" aria-label="Mon compte">
            <UserRound className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink to="/restaurant" variant="ghost" size="icon" aria-label="Mon restaurant">
            <Store className="h-4 w-4" />
          </ButtonLink>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Déconnexion"
            onClick={() => {
              signOut();
              void navigate({ to: "/connexion" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <CarteBienvenue
          salutation={salutation}
          dateTexte={maintenant.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          suspendu={data?.restaurant?.statut === "suspendu"}
          motif={data?.restaurant?.motif_suspension ?? null}
        />

        {home.isLoading && <Chargement lignes={3} />}
        {home.isError && (
          <ErreurBloc
            message={(home.error as Error).message || "Impossible de charger vos données."}
            onRetry={() => void home.refetch()}
          />
        )}

        {data && (
          <>
            {/* Raccourcis en cartes visuelles, avec badge sur les commandes */}
            <div className="grid grid-cols-2 gap-3">
              <RaccourciCarte
                to="/commandes"
                icone={<ClipboardList className="h-5 w-5" />}
                titre="Commandes"
                sousTitre={nonLues > 0 ? `${nonLues} à traiter` : "Tout est à jour"}
                badge={nonLues}
                degrade="primary"
              />
              <RaccourciCarte
                to="/menu"
                icone={<UtensilsCrossed className="h-5 w-5" />}
                titre="Mon menu"
                sousTitre={`${data.nombre_plats ?? 0} plats · ${data.nombre_boissons ?? 0} boissons`}
                degrade="night"
              />
            </div>

            {/* CTA promotion : carte dégradée, la plus visuelle de la page */}
            <button
              type="button"
              onClick={() => setPromoOuverte(true)}
              className="press animate-rise relative w-full overflow-hidden rounded-2xl p-5 text-left shadow-[var(--shadow-glow-secondary)] active:scale-[0.99]"
              style={{ backgroundImage: "var(--gradient-secondary)" }}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-secondary-foreground backdrop-blur">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-secondary-foreground">
                    Promouvoir votre restaurant
                  </p>
                  <p className="mt-0.5 text-xs text-secondary-foreground/85">
                    Une photo ou vidéo façon story, visible sur votre vitrine.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-secondary-foreground/80" />
              </div>
            </button>

            <section className="space-y-2">
              <SectionTitre
                action={
                  <ButtonLink to="/commandes" variant="ghost" size="sm">
                    Voir tout
                  </ButtonLink>
                }
              >
                Commandes récentes
              </SectionTitre>
              {data.commandes_recentes?.length ? (
                <div className="space-y-2">
                  {data.commandes_recentes.map((commande) => (
                    <CarteCommande key={commande.id} commande={commande} />
                  ))}
                </div>
              ) : (
                <EtatVide titre="Aucune commande pour l'instant." />
              )}
            </section>

            <section className="space-y-2">
              <SectionTitre
                action={
                  <ButtonLink to="/menu" variant="ghost" size="sm">
                    Voir tout
                  </ButtonLink>
                }
              >
                {`Mes plats (${data.nombre_plats ?? 0})`}
              </SectionTitre>
              {data.plats_populaires?.length ? (
                <GrilleArticles articles={data.plats_populaires} />
              ) : (
                <EtatVide titre="Aucun plat au menu pour l'instant." />
              )}
            </section>

            <section className="space-y-2">
              <SectionTitre
                action={
                  <ButtonLink to="/menu" hash="boissons" variant="ghost" size="sm">
                    Voir tout
                  </ButtonLink>
                }
              >
                {`Mes boissons (${data.nombre_boissons ?? 0})`}
              </SectionTitre>
              {data.boissons_populaires?.length ? (
                <GrilleArticles articles={data.boissons_populaires} />
              ) : (
                <EtatVide titre="Aucune boisson au menu pour l'instant." />
              )}
            </section>
          </>
        )}
      </div>

      {promoOuverte && token && data && (
        <PromotionDialog
          token={token}
          plats={data.plats_populaires ?? []}
          boissons={data.boissons_populaires ?? []}
          onClose={() => setPromoOuverte(false)}
          onCreated={() => void home.refetch()}
        />
      )}
    </AppShell>
  );
}
