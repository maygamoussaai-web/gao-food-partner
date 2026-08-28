import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/conditions")({
  head: () => ({
    meta: [
      { title: "Conditions et confidentialité — GAO FOOD" },
      {
        name: "description",
        content:
          "Conditions d'utilisation et politique de confidentialité de GAO FOOD pour les restaurateurs partenaires de Gao.",
      },
      { property: "og:title", content: "Conditions et confidentialité — GAO FOOD" },
      {
        property: "og:description",
        content:
          "Règles d'utilisation, traitement des données et obligations des restaurateurs sur GAO FOOD.",
      },
    ],
  }),
  component: Conditions,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="space-y-2 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Conditions() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Conditions d'utilisation et politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Applicables aux restaurateurs partenaires de GAO FOOD.
          </p>
        </div>

        <Section title="1. Objet">
          <p>
            GAO FOOD est une plateforme qui met en relation les restaurants de Gao et leurs
            clients. L'application restaurateur permet de publier un menu (plats et boissons),
            de diffuser des promotions, de recevoir des commandes en ligne et d'en assurer le
            suivi. En créant un compte, le restaurateur accepte les présentes conditions.
          </p>
        </Section>

        <Section title="2. Compte et identification">
          <p>
            Le compte est créé avec un numéro de téléphone et un mot de passe. Le numéro de
            téléphone constitue l'identifiant de connexion : il doit être valide et joignable,
            car il sert aussi à la réinitialisation du mot de passe. Le mot de passe est
            conservé sous forme chiffrée et n'est jamais visible par GAO FOOD. Le restaurateur
            est responsable de la confidentialité de ses identifiants et de toute action
            effectuée depuis son compte.
          </p>
        </Section>

        <Section title="3. Données collectées">
          <p>Nous collectons et traitons uniquement les données nécessaires au service :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Restaurateur : prénom, nom, numéro de téléphone, mot de passe chiffré.</li>
            <li>
              Restaurant : nom, logo, quartier, horaires d'ouverture, prix et délais de
              livraison.
            </li>
            <li>Menu : plats et boissons (nom, prix, photo, ingrédients), promotions.</li>
            <li>
              Commandes : articles, quantités, montants, statuts, horodatages, ainsi que les
              coordonnées de l'acheteur (prénom, nom, numéro) et sa localisation transmise par
              message vocal ou lien de carte.
            </li>
            <li>Paiements : historique du solde dû à l'administration.</li>
          </ul>
        </Section>

        <Section title="4. Utilisation des données">
          <p>
            Les données du restaurant et du menu sont publiques : elles s'affichent sur la
            vitrine consultée par les clients. Les coordonnées de l'acheteur sont communiquées
            au restaurateur dans le seul but de préparer et de livrer la commande. Elles ne
            doivent servir à aucune autre finalité, notamment aucune sollicitation commerciale.
            GAO FOOD ne vend pas les données à des tiers.
          </p>
        </Section>

        <Section title="5. Commandes">
          <p>
            Le restaurateur s'engage à traiter les commandes reçues avec diligence, à respecter
            les prix affichés et les délais de livraison annoncés. Une commande n'est marquée
            comme payée qu'après réception effective du paiement. Les commandes reçues en
            dehors des horaires d'ouverture déclarés sont refusées automatiquement.
          </p>
        </Section>

        <Section title="6. Annulations">
          <p>
            Le restaurateur peut annuler une commande lorsqu'il ne peut pas l'honorer. Le
            nombre d'annulations est limité par jour ; au-delà de cette limite, le restaurant
            peut être suspendu de la vitrine afin de préserver la confiance des clients.
          </p>
        </Section>

        <Section title="7. Solde dû à l'administration">
          <p>
            Chaque commande marquée comme payée et chaque promotion publiée génèrent un montant
            dû à l'administration de GAO FOOD, cumulé dans le solde du restaurant. Ce solde est
            consultable à tout moment depuis la page Restaurant et se règle auprès de
            l'administration via le canal indiqué dans l'application. Un solde impayé peut
            entraîner la suspension du restaurant et empêche la suppression du compte.
          </p>
        </Section>

        <Section title="8. Contenus publiés">
          <p>
            Le restaurateur garantit détenir les droits sur les photos, vidéos et textes qu'il
            publie et s'engage à ce que les contenus soient licites, non trompeurs et conformes
            à l'offre réelle du restaurant. GAO FOOD peut retirer tout contenu contraire à ces
            règles.
          </p>
        </Section>

        <Section title="9. Suspension et résiliation">
          <p>
            GAO FOOD peut suspendre un restaurant en cas de manquement aux présentes conditions,
            d'annulations répétées ou de solde impayé. Le restaurateur peut supprimer son
            restaurant à tout moment depuis l'application ; la suppression exige une
            confirmation par mot de passe puis la saisie du nom exact du restaurant. Elle est
            impossible tant que le solde dû à l'administration n'est pas nul. Une fois
            confirmée, la suppression est définitive et irréversible : le restaurant, le compte
            restaurateur et l'ensemble des données liées sont effacés.
          </p>
        </Section>

        <Section title="10. Sécurité">
          <p>
            Les accès sont protégés par authentification, les mots de passe sont chiffrés et les
            écritures en base sont contrôlées côté serveur. Aucun système n'étant infaillible, le
            restaurateur doit signaler sans délai toute utilisation suspecte de son compte.
          </p>
        </Section>

        <Section title="11. Vos droits">
          <p>
            Le restaurateur peut consulter et modifier ses informations personnelles et celles de
            son restaurant depuis l'application, et demander la suppression de ses données par la
            suppression de son restaurant. Pour toute question relative à ses données, il peut
            contacter l'administration de GAO FOOD.
          </p>
        </Section>

        <Section title="12. Évolution des conditions">
          <p>
            Les présentes conditions peuvent être mises à jour pour refléter l'évolution du
            service. La poursuite de l'utilisation de l'application après mise à jour vaut
            acceptation.
          </p>
        </Section>
      </main>
    </div>
  );
}
