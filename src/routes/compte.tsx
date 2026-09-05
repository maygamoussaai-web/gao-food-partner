import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { History, KeyRound, LogOut, Phone, ShieldCheck, Store, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { DeconnexionConfirm } from "@/components/logout-confirm";
import { Field, FormError, Input } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { Button, ButtonLink, Card, SectionTitre } from "@/components/ui-kit";
import { useAuth } from "@/hooks/use-auth";
import { compteApi } from "@/lib/compte-api";

export const Route = createFileRoute("/compte")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mon compte — GAO FOOD" },
      {
        name: "description",
        content:
          "Gérez vos informations personnelles de restaurateur GAO FOOD : nom, numéro et mot de passe.",
      },
      { property: "og:title", content: "Mon compte — GAO FOOD" },
      {
        property: "og:description",
        content: "Informations personnelles et sécurité du compte restaurateur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageCompte,
});

function PageCompte() {
  const { token, restaurateur, restaurant } = useAuth();
  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false);

  return (
    <AppShell titre="Mon compte" sousTitre={restaurant?.nom ?? "Restaurateur GAO FOOD"}>
      <div className="space-y-6">
        <EnTeteProfil />

        <section className="space-y-3">
          <SectionTitre>Raccourcis</SectionTitre>
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink to="/restaurant" variant="outline" className="h-auto justify-start p-4">
              <Store className="h-4 w-4 text-secondary-foreground" />
              Gérer mon restaurant
            </ButtonLink>
            <ButtonLink to="/historique" variant="outline" className="h-auto justify-start p-4">
              <History className="h-4 w-4 text-secondary-foreground" />
              Historique des commandes
            </ButtonLink>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitre>Informations personnelles</SectionTitre>
          <FormulaireProfil />
        </section>

        <section className="space-y-3">
          <SectionTitre>Sécurité</SectionTitre>
          <FormulaireMotDePasse token={token} />
        </section>

        <section className="space-y-3">
          <SectionTitre>Session</SectionTitre>
          <Card>
            <p className="text-sm text-muted-foreground">
              Vous êtes connecté en tant que{" "}
              <strong className="text-foreground">
                {restaurateur?.prenom} {restaurateur?.nom}
              </strong>
              . La déconnexion effacera la session de cet appareil.
            </p>
            <Button
              variant="danger"
              className="mt-3 w-full"
              onClick={() => setConfirmDeconnexion(true)}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </Card>
        </section>
      </div>

      <DeconnexionConfirm
        ouvert={confirmDeconnexion}
        onFermer={() => setConfirmDeconnexion(false)}
      />
    </AppShell>
  );
}

function EnTeteProfil() {
  const { restaurateur, restaurant } = useAuth();
  const initiales = `${restaurateur?.prenom?.[0] ?? ""}${restaurateur?.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="animate-rise card-highlight flex items-center gap-4 p-5">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ backgroundImage: "var(--gradient-secondary)" }}
      >
        {initiales || <UserRound className="h-7 w-7" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-extrabold text-foreground">
          {restaurateur?.prenom} {restaurateur?.nom}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {restaurateur?.numero}
        </p>
        {restaurant?.nom ? (
          <span className="chip mt-2 inline-flex items-center gap-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            {restaurant.nom}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FormulaireProfil() {
  const { token, restaurateur, setSession, restaurant } = useAuth();
  const [prenom, setPrenom] = useState(restaurateur?.prenom ?? "");
  const [nom, setNom] = useState(restaurateur?.nom ?? "");
  const [numero, setNumero] = useState(restaurateur?.numero ?? "");
  const [erreur, setErreur] = useState<string | null>(null);

  const modifie =
    prenom !== (restaurateur?.prenom ?? "") ||
    nom !== (restaurateur?.nom ?? "") ||
    numero !== (restaurateur?.numero ?? "");

  const m = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Session expirée.");
      if (!prenom.trim() || !nom.trim()) throw new Error("Prénom et nom sont obligatoires.");
      if (numero.trim().length < 8) throw new Error("Numéro de téléphone invalide.");
      return compteApi.updateProfil(token, {
        prenom: prenom.trim(),
        nom: nom.trim(),
        numero: numero.trim(),
      });
    },
    onSuccess: (data) => {
      setErreur(null);
      toast.success("Informations mises à jour.");
      if (token && restaurateur && restaurant) {
        setSession({
          token,
          restaurateur: { ...restaurateur, ...data.restaurateur },
          restaurant,
        });
      }
    },
    onError: (e: Error) => setErreur(e.message),
  });

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setErreur(null);
          m.mutate();
        }}
      >
        <FormError>{erreur}</FormError>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom">
            <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </Field>
          <Field label="Nom">
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </Field>
        </div>
        <Field label="Numéro de téléphone" hint="Il sert aussi d'identifiant de connexion.">
          <Input
            type="tel"
            inputMode="tel"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={!modifie} loading={m.isPending}>
          {m.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </form>
    </Card>
  );
}

function FormulaireMotDePasse({ token }: { token: string | null }) {
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Session expirée.");
      if (nouveau.length < 6) throw new Error("Le nouveau mot de passe doit faire 6 caractères minimum.");
      if (nouveau !== confirmation) throw new Error("La confirmation ne correspond pas.");
      return compteApi.changerMotDePasse(token, ancien, nouveau);
    },
    onSuccess: () => {
      setErreur(null);
      setAncien("");
      setNouveau("");
      setConfirmation("");
      toast.success("Mot de passe modifié.");
    },
    onError: (e: Error) => setErreur(e.message),
  });

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setErreur(null);
          m.mutate();
        }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <KeyRound className="h-4 w-4 text-secondary-foreground" />
          Changer le mot de passe
        </div>
        <FormError>{erreur}</FormError>
        <Field label="Mot de passe actuel">
          <PasswordInput
            autoComplete="current-password"
            required
            value={ancien}
            onChange={(e) => setAncien(e.target.value)}
          />
        </Field>
        <Field label="Nouveau mot de passe" hint="6 caractères minimum.">
          <PasswordInput
            autoComplete="new-password"
            required
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
          />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <PasswordInput
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </Field>
        <Button type="submit" variant="night" className="w-full" loading={m.isPending}>
          {m.isPending ? "Modification…" : "Mettre à jour le mot de passe"}
        </Button>
      </form>
    </Card>
  );
}
