import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CircleCheckBig, Clock3, LogOut, MessageCircle, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppBackground } from "@/components/svg-backgrounds";
import { Button } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/auth-api";

export const Route = createFileRoute("/en-attente")({
  component: EnAttentePage,
  head: () => ({
    meta: [
      { title: "Validation en cours — GAO FOOD" },
      {
        name: "description",
        content: "Votre restaurant est en attente de validation par l'administrateur GAO FOOD.",
      },
    ],
  }),
});

/** Numéro WhatsApp de l'administrateur (jamais affiché à l'écran). */
const WHATSAPP_ADMIN = "22360673302";

function EnAttentePage() {
  const navigate = useNavigate();
  const { token, restaurant, majRestaurant, signOut } = useAuth();
  const [verification, setVerification] = useState(false);

  const statut = restaurant?.statut ?? "en_attente";
  const refuse = statut === "refuse";
  const actif = statut === "actif";

  const contacterAdmin = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis ${restaurant?.nom ?? "restaurateur"} sur GAO FOOD et je souhaite échanger au sujet de la validation de mon restaurant.`,
    );
    window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${message}`, "_blank", "noopener");
  };

  const reverifier = async () => {
    if (!token) return;
    setVerification(true);
    try {
      const data = await authApi.session(token);
      majRestaurant(data.restaurant);
      if (data.restaurant.statut === "actif") {
        toast.success("Votre restaurant a été validé ! Bienvenue 🎉");
        void navigate({ to: "/tableau-de-bord", replace: true });
      } else if (data.restaurant.statut === "refuse") {
        toast.error("La création de votre restaurant a été refusée.");
      } else {
        toast.info("Votre restaurant est toujours en cours de validation.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Vérification impossible pour le moment.");
    } finally {
      setVerification(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <AppBackground />

      <div className="animate-rise relative w-full max-w-md rounded-3xl border border-border bg-card/90 p-7 text-center shadow-[var(--shadow-sheet)] backdrop-blur-xl">
        <div className="mb-5 flex justify-center">
          <Wordmark />
        </div>

        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full shadow-[var(--shadow-glow)] ${
            refuse ? "bg-destructive text-destructive-foreground" : actif ? "bg-primary text-primary-foreground" : "text-primary-foreground"
          }`}
          style={refuse || actif ? undefined : { backgroundImage: "var(--gradient-secondary)" }}
        >
          {refuse ? (
            <XCircle className="h-8 w-8" />
          ) : actif ? (
            <CircleCheckBig className="h-8 w-8" />
          ) : (
            <Clock3 className="h-8 w-8 animate-pulse" />
          )}
        </div>

        {actif ? (
          <>
            <h1 className="text-xl font-bold text-foreground">Restaurant validé 🎉</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              L'administrateur a validé <strong className="text-foreground">{restaurant?.nom}</strong>.
              Vous pouvez continuer vers votre espace.
            </p>
          </>
        ) : refuse ? (
          <>
            <h1 className="text-xl font-bold text-foreground">Création refusée</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              L'administrateur a refusé la création de{" "}
              <strong className="text-foreground">{restaurant?.nom}</strong>.
            </p>
            {restaurant?.motif_refus ? (
              <p className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Motif : {restaurant.motif_refus}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Vous pouvez contacter l'administrateur pour comprendre ce refus ou corriger votre demande.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">Validation en cours…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="text-foreground">{restaurant?.nom}</strong> est en attente de
              validation par l'administrateur. Aucun restaurant ne peut être ouvert sans cette
              validation. Vous serez redirigé dès qu'elle sera effectuée.
            </p>
          </>
        )}

        <div className="mt-6 space-y-2.5">
          {actif ? (
            <Button
              className="w-full"
              onClick={() => void navigate({ to: "/tableau-de-bord", replace: true })}
            >
              Continuer vers l'accueil
            </Button>
          ) : (
            <Button className="w-full" loading={verification} onClick={() => void reverifier()}>
              <RefreshCw className={`h-4 w-4 ${verification ? "animate-spin" : ""}`} />
              {refuse ? "Revérifier ma demande" : "Vérifier la validation"}
            </Button>
          )}

          <Button variant="secondary" className="w-full" onClick={contacterAdmin}>
            <MessageCircle className="h-4 w-4" />
            Contacter l'administrateur sur WhatsApp
          </Button>

          <button
            type="button"
            onClick={() => {
              signOut();
              void navigate({ to: "/connexion", replace: true });
            }}
            className="press mx-auto mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
