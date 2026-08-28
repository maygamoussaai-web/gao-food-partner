import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Field, FormError, Input } from "@/components/form-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui-kit";
import { Wordmark } from "@/components/wordmark";
import { authApi } from "@/lib/auth-api";

export const Route = createFileRoute("/mot-de-passe-oublie")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — GAO FOOD" },
      {
        name: "description",
        content:
          "Réinitialisez le mot de passe de votre compte restaurateur GAO FOOD avec un code de vérification.",
      },
      { property: "og:title", content: "Mot de passe oublié — GAO FOOD" },
      {
        property: "og:description",
        content: "Recevez un code de vérification et choisissez un nouveau mot de passe.",
      },
    ],
  }),
  component: MotDePasseOublie,
});

function MotDePasseOublie() {
  const [etape, setEtape] = useState<"demande" | "code" | "fini">("demande");
  const [numero, setNumero] = useState("");
  const [code, setCode] = useState("");
  const [codeDebug, setCodeDebug] = useState<string | null>(null);
  const [nouveau, setNouveau] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function demander(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.resetRequest(numero.trim());
      setCodeDebug(res.code_debug ?? null);
      setEtape("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nouveau.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setBusy(true);
    try {
      await authApi.resetConfirm(numero.trim(), code.trim(), nouveau);
      setEtape("fini");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réinitialisation impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-5">
        <Wordmark className="text-sm" />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Mot de passe oublié</h1>

        {etape === "demande" && (
          <>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Indiquez le numéro de votre compte, nous vous enverrons un code à 6 chiffres.
            </p>
            <form className="mt-8 space-y-4" onSubmit={demander}>
              <FormError>{error}</FormError>
              <Field label="Numéro de téléphone">
                <Input
                  type="tel"
                  inputMode="tel"
                  required
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Envoi…" : "Recevoir le code"}
              </Button>
            </form>
          </>
        )}

        {etape === "code" && (
          <>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Saisissez le code reçu puis choisissez un nouveau mot de passe.
            </p>
            {codeDebug && (
              <p className="mt-4 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
                Mode test — l'envoi SMS n'est pas encore branché. Votre code :{" "}
                <strong className="tracking-widest">{codeDebug}</strong>
              </p>
            )}
            <form className="mt-6 space-y-4" onSubmit={confirmer}>
              <FormError>{error}</FormError>
              <Field label="Code à 6 chiffres">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="tracking-[0.4em]"
                />
              </Field>
              <Field label="Nouveau mot de passe" hint="6 caractères minimum.">
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={nouveau}
                  onChange={(e) => setNouveau(e.target.value)}
                />
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Enregistrement…" : "Réinitialiser"}
              </Button>
            </form>
          </>
        )}

        {etape === "fini" && (
          <p className="mt-4 rounded-lg border border-border bg-muted px-3 py-3 text-[15px] text-foreground">
            Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/connexion" className="underline underline-offset-4 hover:text-foreground">
            Retour à la connexion
          </Link>
        </p>
      </main>
    </div>
  );
}
