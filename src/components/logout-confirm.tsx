import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui-kit";
import { useAuth } from "@/hooks/use-auth";

/**
 * Boîte de confirmation affichée avant toute déconnexion.
 * Évite qu'un appui accidentel ne ferme la session.
 */
export function DeconnexionConfirm({
  ouvert,
  onFermer,
}: {
  ouvert: boolean;
  onFermer: () => void;
}) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (!ouvert || typeof document === "undefined") return null;

  const confirmer = () => {
    signOut();
    onFermer();
    toast.success("Vous êtes déconnecté.");
    void navigate({ to: "/connexion", replace: true });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmer la déconnexion"
    >
      <button
        type="button"
        aria-label="Annuler"
        onClick={onFermer}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
      />
      <div className="animate-rise relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-sheet)]">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)]"
          style={{ backgroundImage: "var(--gradient-secondary)" }}
        >
          <LogOut className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Se déconnecter ?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Votre session sera fermée sur cet appareil. Vous pourrez vous reconnecter à tout moment.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button variant="ghost" onClick={onFermer}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmer}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
