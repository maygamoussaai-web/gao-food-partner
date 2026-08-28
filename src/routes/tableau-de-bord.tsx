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
import { useEffect, useState, type ReactNode } from "react";

import { PromotionDialog } from "@/components/promotion-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, ButtonLink, Card } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
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

function Section({
  titre,
  action,
  children,
}: {
  titre: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {titre}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EtatVide({ texte }: { texte: string }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{texte}</p>
    </Card>
  );
}

function CarteCommande({ commande }: { commande: CommandeRecente }) {
  const date = new Date(commande.created_at);
  return (
    <Card>
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
    </Card>
  );
}

function ListeArticles({ articles }: { articles: ArticlePopulaire[] }) {
  return (
    <Card className="p-0">
      <ul className="divide-y divide-border">
        {articles.map((article) => (
          <li key={article.id} className="flex items-center gap-3 px-4 py-3">
            {article.photo_url ? (
              <img
                src={article.photo_url}
                alt={article.nom}
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{article.nom}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrix(article.prix)} · {article.nombre_commandes ?? 0} commande
                {(article.nombre_commandes ?? 0) > 1 ? "s" : ""}
              </p>
            </div>
            {article.note_moyenne != null && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-current" />
                {Number(article.note_moyenne).toFixed(1)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TableauDeBord() {
  const navigate = useNavigate();
  const { loading, restaurateur, signOut } = useAuth();
  const maintenant = useHorloge();
  const [promoOuverte, setPromoOuverte] = useState(false);
  const token = typeof window === "undefined" ? null : readToken();

  useEffect(() => {
    if (!loading && !restaurateur) void navigate({ to: "/connexion" });
  }, [loading, restaurateur, navigate]);

  const home = useQuery({
    queryKey: ["home", token],
    queryFn: () => homeApi.getHome(token as string),
    enabled: Boolean(token) && Boolean(restaurateur),
  });

  if (loading || !restaurateur) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  const data = home.data;
  const heure = maintenant.getHours();
  const jour = heure >= 5 && heure < 18;
  const nom = `${data?.restaurateur.prenom ?? restaurateur.prenom} ${data?.restaurateur.nom ?? restaurateur.nom}`.trim();
  const salutation = jour
    ? `Bonjour, comment allez-vous ? 👋 M./Mme ${nom}`
    : `Bonsoir, comment s'est passée votre journée ? 🌃 M./Mme ${nom}`;
  const nonLues = data?.commandes_non_lues ?? 0;

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <Wordmark className="text-sm" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink to="/compte" variant="ghost" size="sm" aria-label="Mon compte">
            <UserRound className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink to="/restaurant" variant="ghost" size="sm" aria-label="Mon restaurant">
            <Store className="h-4 w-4" />
          </ButtonLink>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Déconnexion"
            onClick={() => {
              signOut();
              void navigate({ to: "/connexion" });
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-6 px-5 py-6">
        <div>
          <h1 className="text-xl font-semibold leading-snug text-foreground">{salutation}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {maintenant.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            ·{" "}
            {maintenant.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          {data?.restaurant?.statut === "suspendu" && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Restaurant suspendu. {String(data.restaurant.motif_suspension ?? "")}
            </p>
          )}
        </div>

        {home.isLoading && <EtatVide texte="Chargement de votre tableau de bord…" />}
        {home.isError && (
          <Card>
            <p className="text-sm text-destructive">
              {(home.error as Error).message || "Impossible de charger vos données."}
            </p>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => void home.refetch()}>
              Réessayer
            </Button>
          </Card>
        )}

        {data && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <ButtonLink
                to="/commandes"
                variant="outline"
                className="h-auto justify-between px-4 py-3"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Consulter vos commandes
                </span>
                <span className="flex items-center gap-2">
                  {nonLues > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                      {nonLues}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </span>
              </ButtonLink>
              <ButtonLink to="/menu" variant="outline" className="h-auto justify-between px-4 py-3">
                <span className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" /> Consulter votre menu
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </ButtonLink>
            </div>

            <Section
              titre="Commandes récentes"
              action={
                <ButtonLink to="/commandes" variant="ghost" size="sm">
                  Voir tout
                </ButtonLink>
              }
            >
              {data.commandes_recentes?.length ? (
                <div className="space-y-2">
                  {data.commandes_recentes.map((commande) => (
                    <CarteCommande key={commande.id} commande={commande} />
                  ))}
                </div>
              ) : (
                <EtatVide texte="Aucune commande pour l'instant." />
              )}
            </Section>

            <Section
              titre={`Mes plats (${data.nombre_plats ?? 0})`}
              action={
                <ButtonLink to="/menu" variant="ghost" size="sm">
                  Voir tout
                </ButtonLink>
              }
            >
              {data.plats_populaires?.length ? (
                <ListeArticles articles={data.plats_populaires} />
              ) : (
                <EtatVide texte="Aucun plat au menu pour l'instant." />
              )}
            </Section>

            <Section titre="Promouvoir votre restaurant">
              <Card>
                <p className="text-sm text-muted-foreground">
                  Publiez une photo ou une vidéo façon story : elle apparaît sur votre vitrine
                  côté client.
                </p>
                <Button className="mt-3" size="sm" onClick={() => setPromoOuverte(true)}>
                  <Megaphone className="h-4 w-4" /> Créer une promotion
                </Button>
              </Card>
            </Section>

            <Section
              titre={`Mes boissons (${data.nombre_boissons ?? 0})`}
              action={
                <ButtonLink
                  to="/menu"
                  search={{ tab: "boissons" }}
                  variant="ghost"
                  size="sm"
                >
                  Voir tout
                </ButtonLink>
              }
            >
              {data.boissons_populaires?.length ? (
                <ListeArticles articles={data.boissons_populaires} />
              ) : (
                <EtatVide texte="Aucune boisson au menu pour l'instant." />
              )}
            </Section>
          </>
        )}
      </main>

      {promoOuverte && token && data && (
        <PromotionDialog
          token={token}
          plats={data.plats_populaires ?? []}
          boissons={data.boissons_populaires ?? []}
          onClose={() => setPromoOuverte(false)}
          onCreated={() => void home.refetch()}
        />
      )}
    </div>
  );
}
