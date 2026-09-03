import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bike,
  Clock3,
  MapPin,
  Store,
  Timer,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, Chargement, ErreurBloc } from "@/components/app-shell";
import { Field, FormError, Input } from "@/components/form-field";
import { MediaPicker } from "@/components/media-picker";
import { PasswordInput } from "@/components/password-input";
import { PhotoRonde } from "@/components/photo-zoom";
import { Button, Card, SectionTitre } from "@/components/ui-kit";
import { useAuth } from "@/hooks/use-auth";
import { compteApi, type RestaurantComplet } from "@/lib/compte-api";
import { fileToBase64, formatPrix, homeApi } from "@/lib/home-api";
import { uploadMedia } from "@/lib/menu-api";

export const Route = createFileRoute("/restaurant")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mon restaurant — GAO FOOD" },
      {
        name: "description",
        content:
          "Paramètres de votre restaurant à Gao : logo, quartier, prix de livraison, horaires et solde administrateur.",
      },
      { property: "og:title", content: "Mon restaurant — GAO FOOD" },
      {
        property: "og:description",
        content: "Réglages de livraison, horaires d'ouverture et solde administrateur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PageRestaurant,
});

const heure = (v: string | null | undefined) => (v ? String(v).slice(0, 5) : "");

function PageRestaurant() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const home = useQuery({
    queryKey: ["home", token],
    queryFn: () => homeApi.getHome(token as string),
    enabled: Boolean(token),
  });

  const resto = home.data?.restaurant as RestaurantComplet | undefined;

  return (
    <AppShell titre="Mon restaurant" sousTitre={resto?.quartier ?? "Réglages de l'établissement"}>
      {home.isPending && <Chargement lignes={5} />}
      {home.isError && (
        <ErreurBloc message={(home.error as Error).message} onRetry={() => void home.refetch()} />
      )}

      {resto && (
        <div className="space-y-6">
          <CarteIdentite resto={resto} />

          <section className="space-y-3">
            <SectionTitre>Solde administrateur</SectionTitre>
            <CarteSolde resto={resto} />
          </section>

          <section className="space-y-3">
            <SectionTitre>Logo du restaurant</SectionTitre>
            <BlocLogo
              token={token}
              resto={resto}
              onDone={() => void qc.invalidateQueries({ queryKey: ["home"] })}
            />
          </section>

          <section className="space-y-3">
            <SectionTitre>Informations & livraison</SectionTitre>
            <FormulaireRestaurant
              token={token}
              resto={resto}
              onDone={() => void qc.invalidateQueries({ queryKey: ["home"] })}
            />
          </section>

          <section className="space-y-3">
            <SectionTitre>Zone sensible</SectionTitre>
            <BlocSuppression token={token} resto={resto} />
          </section>
        </div>
      )}
    </AppShell>
  );
}

function CarteIdentite({ resto }: { resto: RestaurantComplet }) {
  const suspendu = resto.statut === "suspendu";
  return (
    <div className="animate-rise card-highlight flex items-center gap-4 p-5">
      <PhotoRonde
        src={resto.logo_url}
        alt={resto.nom}
        taille="h-16 w-16"
        fallback={<Store className="h-6 w-6" />}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-extrabold text-foreground">{resto.nom}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {resto.quartier}
        </p>
        <span
          className={`chip mt-2 inline-flex items-center gap-1 text-xs ${
            suspendu ? "text-destructive" : ""
          }`}
        >
          {suspendu ? <TriangleAlert className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          {suspendu
            ? "Restaurant suspendu"
            : `Ouvert ${heure(resto.horaire_ouverture)} – ${heure(resto.horaire_fermeture)}`}
        </span>
        {suspendu && resto.motif_suspension ? (
          <p className="mt-2 text-xs text-destructive">{resto.motif_suspension}</p>
        ) : null}
      </div>
    </div>
  );
}

function CarteSolde({ resto }: { resto: RestaurantComplet }) {
  const solde = Number(resto.solde_admin ?? 0);
  return (
    <Card highlight>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ backgroundImage: "var(--gradient-secondary)" }}
        >
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-foreground">
            À reverser à l'administrateur
          </p>
          <p className="text-2xl font-extrabold text-foreground">{formatPrix(solde)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {solde > 0
          ? "Ce solde doit être réglé auprès de l'administrateur GAO FOOD. Tant qu'il n'est pas soldé, la suppression du restaurant reste impossible."
          : "Aucun montant en attente. Votre compte est à jour."}
      </p>
    </Card>
  );
}

function BlocLogo({
  token,
  resto,
  onDone,
}: {
  token: string | null;
  resto: RestaurantComplet;
  onDone: () => void;
}) {
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Session expirée.");
      if (!fichier) throw new Error("Choisissez une image.");
      const base64 = await fileToBase64(fichier);
      const { url } = await uploadMedia(token, base64, fichier.type, "logos");
      return compteApi.updateRestaurant(token, { logo_url: url });
    },
    onSuccess: () => {
      setFichier(null);
      setErreur(null);
      toast.success("Logo mis à jour.");
      onDone();
    },
    onError: (e: Error) => setErreur(e.message),
  });

  const retirer = useMutation({
    mutationFn: () => compteApi.retirerLogo(token as string),
    onSuccess: () => {
      toast.success("Logo retiré.");
      onDone();
    },
    onError: (e: Error) => setErreur(e.message),
  });

  return (
    <Card>
      <div className="flex flex-wrap items-start gap-4">
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Logo actuel</span>
          <PhotoRonde
            src={resto.logo_url}
            alt={resto.nom}
            taille="h-20 w-20"
            fallback={<Store className="h-6 w-6" />}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <MediaPicker
            value={fichier}
            onChange={setFichier}
            rond
            label="Nouveau logo"
            hint="Image de 3 Mo maximum, compressée automatiquement."
          />
        </div>
      </div>

      {erreur ? <div className="mt-3"><FormError>{erreur}</FormError></div> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={!fichier} loading={envoyer.isPending} onClick={() => envoyer.mutate()}>
          {envoyer.isPending ? "Envoi…" : "Enregistrer le logo"}
        </Button>
        {resto.logo_url ? (
          <Button variant="ghost" loading={retirer.isPending} onClick={() => retirer.mutate()}>
            Retirer le logo
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function FormulaireRestaurant({
  token,
  resto,
  onDone,
}: {
  token: string | null;
  resto: RestaurantComplet;
  onDone: () => void;
}) {
  const [nom, setNom] = useState(resto.nom);
  const [quartier, setQuartier] = useState(resto.quartier);
  const [prix, setPrix] = useState(String(resto.prix_livraison ?? 0));
  const [ouverture, setOuverture] = useState(heure(resto.horaire_ouverture));
  const [fermeture, setFermeture] = useState(heure(resto.horaire_fermeture));
  const [delaiMin, setDelaiMin] = useState(String(resto.delai_livraison_min_min ?? ""));
  const [delaiMax, setDelaiMax] = useState(String(resto.delai_livraison_max_min ?? ""));
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    setNom(resto.nom);
    setQuartier(resto.quartier);
    setPrix(String(resto.prix_livraison ?? 0));
    setOuverture(heure(resto.horaire_ouverture));
    setFermeture(heure(resto.horaire_fermeture));
    setDelaiMin(String(resto.delai_livraison_min_min ?? ""));
    setDelaiMax(String(resto.delai_livraison_max_min ?? ""));
  }, [resto]);

  const m = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Session expirée.");
      if (!nom.trim()) throw new Error("Le nom du restaurant est obligatoire.");
      if (!quartier.trim()) throw new Error("Le quartier est obligatoire.");
      const prixNum = Number(prix);
      const min = Number(delaiMin);
      const max = Number(delaiMax);
      if (Number.isNaN(prixNum) || prixNum < 0) throw new Error("Prix de livraison invalide.");
      if (!ouverture || !fermeture) throw new Error("Renseignez les horaires d'ouverture.");
      if (!min || !max || min <= 0 || max <= 0) throw new Error("Délais de livraison invalides.");
      if (min > max) throw new Error("Le délai minimum doit être inférieur au délai maximum.");

      return compteApi.updateRestaurant(token, {
        nom: nom.trim(),
        quartier: quartier.trim(),
        prix_livraison: prixNum,
        horaire_ouverture: ouverture,
        horaire_fermeture: fermeture,
        delai_livraison_min_min: min,
        delai_livraison_max_min: max,
      });
    },
    onSuccess: () => {
      setErreur(null);
      toast.success("Restaurant mis à jour.");
      onDone();
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

        <Field label="Nom du restaurant">
          <Input value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
        <Field label="Quartier">
          <Input value={quartier} onChange={(e) => setQuartier(e.target.value)} />
        </Field>

        <Field label="Prix de livraison (FCFA)">
          <Input
            value={prix}
            inputMode="numeric"
            onChange={(e) => setPrix(e.target.value.replace(/\D/g, ""))}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heure d'ouverture">
            <Input type="time" value={ouverture} onChange={(e) => setOuverture(e.target.value)} />
          </Field>
          <Field label="Heure de fermeture">
            <Input type="time" value={fermeture} onChange={(e) => setFermeture(e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Délai livraison min (min)">
            <Input
              value={delaiMin}
              inputMode="numeric"
              onChange={(e) => setDelaiMin(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <Field label="Délai livraison max (min)">
            <Input
              value={delaiMax}
              inputMode="numeric"
              onChange={(e) => setDelaiMax(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="chip inline-flex items-center gap-1">
            <Bike className="h-3.5 w-3.5" />
            {formatPrix(Number(prix || 0))}
          </span>
          <span className="chip inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {delaiMin || "?"}–{delaiMax || "?"} min
          </span>
        </div>

        <Button type="submit" className="w-full" loading={m.isPending}>
          {m.isPending ? "Enregistrement…" : "Enregistrer les réglages"}
        </Button>
      </form>
    </Card>
  );
}

function BlocSuppression({ token, resto }: { token: string | null; resto: RestaurantComplet }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const solde = Number(resto.solde_admin ?? 0);
  const bloque = solde > 0;

  const m = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Session expirée.");
      if (confirmation.trim() !== resto.nom)
        throw new Error("Le nom saisi ne correspond pas au nom du restaurant.");
      return compteApi.supprimerRestaurant(token, motDePasse, confirmation.trim());
    },
    onSuccess: () => {
      toast.success("Restaurant supprimé.");
      signOut();
      void navigate({ to: "/connexion", replace: true });
    },
    onError: (e: Error) => setErreur(e.message),
  });

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <TriangleAlert className="h-4 w-4" />
        Supprimer définitivement le restaurant
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Cette action est irréversible : menu, commandes et promotions seront supprimés.
        {bloque
          ? " Elle est impossible tant que le solde administrateur n'est pas réglé."
          : ""}
      </p>

      {!ouvert ? (
        <Button
          variant="ghost"
          className="mt-3 text-destructive"
          disabled={bloque}
          onClick={() => setOuvert(true)}
        >
          {bloque ? `Solde à régler : ${formatPrix(solde)}` : "Je veux supprimer mon restaurant"}
        </Button>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setErreur(null);
            m.mutate();
          }}
        >
          <FormError>{erreur}</FormError>
          <Field label="Votre mot de passe">
            <PasswordInput
              autoComplete="current-password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
          </Field>
          <Field label={`Tapez « ${resto.nom} » pour confirmer`}>
            <Input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" variant="danger" loading={m.isPending}>
              {m.isPending ? "Suppression…" : "Supprimer définitivement"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
