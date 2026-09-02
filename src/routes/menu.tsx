import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CupSoda,
  Plus,
  Star,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell, Chargement, ErreurBloc, EtatVide } from "@/components/app-shell";
import { Field, Input } from "@/components/form-field";
import { MediaPicker } from "@/components/media-picker";
import { PhotoRonde } from "@/components/photo-zoom";
import { Button } from "@/components/ui-kit";
import { readToken } from "@/lib/auth-api";
import { fileToBase64, formatPrix } from "@/lib/home-api";
import { menuApi, uploadMedia, type ArticleMenu, type TypeArticle } from "@/lib/menu-api";

export const Route = createFileRoute("/menu")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mon menu — GAO FOOD" },
      {
        name: "description",
        content: "Gérez les plats et boissons de votre restaurant de Gao : photos, prix, ingrédients.",
      },
      { property: "og:title", content: "Mon menu — GAO FOOD" },
      { property: "og:description", content: "Plats et boissons de votre restaurant." },
    ],
  }),
  component: PageMenu,
});

function PageMenu() {
  const token = typeof window === "undefined" ? null : readToken();
  const qc = useQueryClient();
  const [onglet, setOnglet] = useState<TypeArticle>("plat");
  const [selection, setSelection] = useState<ArticleMenu | null>(null);
  const [ajout, setAjout] = useState(false);

  const menu = useQuery({
    queryKey: ["menu", token],
    queryFn: () => menuApi.list(token as string),
    enabled: Boolean(token),
  });

  const liste = onglet === "plat" ? menu.data?.plats ?? [] : menu.data?.boissons ?? [];
  const actifs = liste.filter((a) => a.actif);
  const retires = liste.filter((a) => !a.actif);

  const rafraichir = () => void qc.invalidateQueries({ queryKey: ["menu"] });

  return (
    <AppShell
      titre="Mon menu"
      sousTitre={`${menu.data?.plats.filter((p) => p.actif).length ?? 0} plats · ${
        menu.data?.boissons.filter((b) => b.actif).length ?? 0
      } boissons`}
      sousHeader={
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="flex rounded-full bg-muted p-1">
            {(["plat", "boisson"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOnglet(t)}
                className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-all duration-200 ${
                  onglet === t
                    ? "bg-card text-foreground shadow-[var(--shadow-card)]"
                    : "text-muted-foreground"
                }`}
              >
                {t === "plat" ? "Plats" : "Boissons"}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {menu.isLoading && <Chargement lignes={5} />}
      {menu.isError && (
        <ErreurBloc message={(menu.error as Error).message} onRetry={() => void menu.refetch()} />
      )}

      {menu.data && (
        <div className="space-y-6">
          {actifs.length === 0 ? (
            <EtatVide
              icone={onglet === "plat" ? <UtensilsCrossed className="h-7 w-7" /> : <CupSoda className="h-7 w-7" />}
              titre={onglet === "plat" ? "Aucun plat au menu" : "Aucune boisson au menu"}
              texte="Ajoutez votre premier article pour qu'il apparaisse sur votre vitrine."
            />
          ) : (
            <ul className="overflow-hidden rounded-xl border border-border bg-card">
              {actifs.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => setSelection(article)}
                    className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-muted/60 active:bg-muted"
                  >
                    <Vignette article={article} type={onglet} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-foreground">
                        {article.nom}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">{formatPrix(article.prix)}</span>
                        <span aria-hidden>·</span>
                        <span>{article.nombre_commandes ?? 0} cmd</span>
                        {Number(article.note_moyenne) > 0 && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-current" />
                              {Number(article.note_moyenne).toFixed(1)}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {retires.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Retirés du menu
              </h2>
              <ul className="overflow-hidden rounded-xl border border-border bg-card">
                {retires.map((article) => (
                  <li
                    key={article.id}
                    className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-0"
                  >
                    <div className="opacity-50">
                      <Vignette article={article} type={onglet} />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[15px] text-muted-foreground">
                      {article.nom}
                    </span>
                    <RemettreBouton token={token} type={onglet} id={article.id} onDone={rafraichir} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAjout(true)}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-4 w-4" />
        {onglet === "plat" ? "Ajouter un plat" : "Ajouter une boisson"}
      </button>

      {ajout && (
        <FormulaireArticle
          token={token}
          type={onglet}
          onClose={() => setAjout(false)}
          onDone={() => {
            setAjout(false);
            rafraichir();
          }}
        />
      )}

      {selection && (
        <FicheArticle
          token={token}
          type={onglet}
          article={selection}
          onClose={() => setSelection(null)}
          onDone={() => {
            setSelection(null);
            rafraichir();
          }}
        />
      )}
    </AppShell>
  );
}

/** Vignette ronde compacte : un clic ouvre la photo en grand. */
function Vignette({ article, type }: { article: ArticleMenu; type: TypeArticle }) {
  return (
    <PhotoRonde
      src={article.photo_url}
      alt={article.nom}
      taille="h-11 w-11"
      fallback={
        type === "plat" ? (
          <UtensilsCrossed className="h-4 w-4" />
        ) : (
          <CupSoda className="h-4 w-4" />
        )
      }
    />
  );
}

function RemettreBouton({
  token,
  type,
  id,
  onDone,
}: {
  token: string | null;
  type: TypeArticle;
  id: string;
  onDone: () => void;
}) {
  const m = useMutation({
    mutationFn: () => menuApi.remettre(token as string, type, id),
    onSuccess: () => {
      toast.success("Article remis au menu.");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button size="sm" variant="outline" disabled={m.isPending} onClick={() => m.mutate()}>
      {m.isPending ? "…" : "Remettre"}
    </Button>
  );
}

/**
 * Feuille modale glissante, façon bottom-sheet mobile.
 * En-tête fixe + corps défilant + PIED FIXE pour l'action principale, afin
 * qu'un long formulaire (ou le clavier mobile) ne pousse jamais le bouton
 * de validation hors champ.
 */
function Feuille({
  titre,
  onClose,
  children,
  pied,
}: {
  titre: string;
  onClose: () => void;
  children: React.ReactNode;
  pied?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-xl animate-in slide-in-from-bottom duration-250 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5 pb-4">
          <h2 className="text-lg font-semibold text-foreground">{titre}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {pied ? (
          <div className="border-t border-border/60 bg-background/95 p-5 pt-4 backdrop-blur">{pied}</div>
        ) : null}
      </div>
    </div>
  );
}

function FormulaireArticle({
  token,
  type,
  onClose,
  onDone,
}: {
  token: string | null;
  type: TypeArticle;
  onClose: () => void;
  onDone: () => void;
}) {
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [erreur, setErreur] = useState("");

  const m = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Session expirée.");
      if (!nom.trim()) throw new Error("Le nom est obligatoire.");
      const prixNum = Number(prix);
      if (!prix || Number.isNaN(prixNum) || prixNum <= 0) throw new Error("Le prix est obligatoire.");
      if (!photo) throw new Error("La photo est obligatoire.");
      if (type === "plat" && !ingredients.trim())
        throw new Error("Les ingrédients sont obligatoires pour un plat.");

      const base64 = await fileToBase64(photo);
      const { url } = await uploadMedia(token, base64, photo.type, type === "plat" ? "plats" : "boissons");
      return menuApi.create(token, {
        type,
        nom: nom.trim(),
        prix: prixNum,
        photo_url: url,
        ...(type === "plat" ? { ingredients: ingredients.trim() } : {}),
      });
    },
    onSuccess: () => {
      toast.success(type === "plat" ? "Plat ajouté au menu." : "Boisson ajoutée au menu.");
      onDone();
    },
    onError: (e: Error) => setErreur(e.message),
  });

  const idFormulaire = "formulaire-ajout-article";

  return (
    <Feuille
      titre={type === "plat" ? "Ajouter un plat" : "Ajouter une boisson"}
      onClose={onClose}
      pied={
        <>
          {erreur && (
            <p role="alert" className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erreur}
            </p>
          )}
          <Button type="submit" form={idFormulaire} className="w-full" loading={m.isPending}>
            {m.isPending ? "Enregistrement…" : "Ajouter au menu"}
          </Button>
        </>
      }
    >
      <fieldset disabled={m.isPending} className="border-0 p-0 m-0">
        <form
          id={idFormulaire}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setErreur("");
            m.mutate();
          }}
        >
          <MediaPicker value={photo} onChange={setPhoto} label="Photo" hint="Obligatoire." />
          <Field label="Nom">
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Riz au gras" />
          </Field>
          <Field label="Prix (FCFA)">
            <Input
              value={prix}
              inputMode="numeric"
              onChange={(e) => setPrix(e.target.value.replace(/\D/g, ""))}
              placeholder="1500"
            />
          </Field>
          {type === "plat" && (
            <Field label="Ingrédients">
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={3}
                placeholder="Riz, viande, huile, oignons…"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
          )}
        </form>
      </fieldset>
    </Feuille>
  );
}

function FicheArticle({
  token,
  type,
  article,
  onClose,
  onDone,
}: {
  token: string | null;
  type: TypeArticle;
  article: ArticleMenu;
  onClose: () => void;
  onDone: () => void;
}) {
  const [nom, setNom] = useState(article.nom);
  const [prix, setPrix] = useState(String(article.prix));
  const [ingredients, setIngredients] = useState(article.ingredients ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoRetiree, setPhotoRetiree] = useState(false);
  const [erreur, setErreur] = useState("");
  const [confirmRetrait, setConfirmRetrait] = useState(false);

  const modifie = useMemo(
    () =>
      nom !== article.nom ||
      prix !== String(article.prix) ||
      ingredients !== (article.ingredients ?? "") ||
      photo !== null ||
      photoRetiree,
    [nom, prix, ingredients, photo, photoRetiree, article],
  );

  const enregistrer = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Session expirée.");
      const prixNum = Number(prix);
      if (!nom.trim()) throw new Error("Le nom ne peut pas être vide.");
      if (Number.isNaN(prixNum) || prixNum <= 0) throw new Error("Prix invalide.");

      let photo_url: string | null | undefined;
      if (photo) {
        const base64 = await fileToBase64(photo);
        photo_url = (await uploadMedia(token, base64, photo.type, type === "plat" ? "plats" : "boissons")).url;
      } else if (photoRetiree) {
        photo_url = null;
      }

      return menuApi.update(token, {
        type,
        id: article.id,
        nom: nom.trim(),
        prix: prixNum,
        ...(photo_url !== undefined ? { photo_url } : {}),
        ...(type === "plat" ? { ingredients: ingredients.trim() } : {}),
      });
    },
    onSuccess: () => {
      toast.success("Modifications enregistrées.");
      onDone();
    },
    onError: (e: Error) => setErreur(e.message),
  });

  const retirer = useMutation({
    mutationFn: () => menuApi.retirer(token as string, type, article.id),
    onSuccess: () => {
      toast.success("Article retiré du menu.");
      onDone();
    },
    onError: (e: Error) => setErreur(e.message),
  });

  const photoActuelle = photoRetiree ? null : article.photo_url;

  return (
    <Feuille
      titre={article.nom}
      onClose={onClose}
      pied={
        <div className="space-y-2">
          {erreur && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erreur}
            </p>
          )}
          <Button
            className="w-full"
            disabled={!modifie}
            loading={enregistrer.isPending}
            onClick={() => {
              setErreur("");
              enregistrer.mutate();
            }}
          >
            {enregistrer.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>

          {article.actif &&
            (confirmRetrait ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  Retirer « {article.nom} » du menu ? Il ne sera plus visible par les clients.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={retirer.isPending}
                    onClick={() => retirer.mutate()}
                  >
                    {retirer.isPending ? "…" : "Confirmer le retrait"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmRetrait(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" className="w-full text-destructive" onClick={() => setConfirmRetrait(true)}>
                Retirer du menu
              </Button>
            ))}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Stat
            valeur={Number(article.note_moyenne ?? 0) > 0 ? `${Number(article.note_moyenne).toFixed(1)}/5` : "—"}
            label={`${article.nombre_notes ?? 0} note${(article.nombre_notes ?? 0) > 1 ? "s" : ""}`}
          />
          <Stat valeur={String(article.nombre_commandes ?? 0)} label="fois commandé" />
        </div>

        {photo || !photoActuelle ? (
          <MediaPicker value={photo} onChange={setPhoto} label="Photo" />
        ) : (
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Photo</span>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <PhotoRonde src={photoActuelle} alt={article.nom} taille="h-16 w-16" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  Touchez la photo pour l'afficher en grand.
                </p>
                <button
                  type="button"
                  onClick={() => setPhotoRetiree(true)}
                  className="press mt-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground active:scale-95"
                >
                  Changer / retirer
                </button>
              </div>
            </div>
          </div>
        )}

        <Field label="Nom">
          <Input value={nom} onChange={(e) => setNom(e.target.value)} />
        </Field>
        <Field label="Prix (FCFA)">
          <Input
            value={prix}
            inputMode="numeric"
            onChange={(e) => setPrix(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        {type === "plat" && (
          <Field label="Ingrédients">
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-[15px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
        )}
      </div>
    </Feuille>
  );
}

function Stat({ valeur, label }: { valeur: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-lg font-semibold leading-tight text-foreground">{valeur}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
