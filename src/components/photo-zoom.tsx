import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/** Visionneuse plein écran : la photo s'affiche en grand, croix pour rétrécir. */
export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = precedent;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 animate-fade backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Rétrécir la photo"
        className="press absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 active:scale-90"
        style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <X className="h-5 w-5" />
      </button>

      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl animate-rise"
      />
    </div>
  );
}

/**
 * Vignette ronde compacte. Au clic, la photo s'ouvre en grand.
 * Le clic est isolé afin de ne pas déclencher l'élément parent.
 */
export function PhotoRonde({
  src,
  alt,
  fallback,
  taille = "h-11 w-11",
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  fallback?: ReactNode;
  taille?: string;
  className?: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  if (!src) {
    return (
      <span
        className={`flex ${taille} shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ${className}`}
      >
        {fallback}
      </span>
    );
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Agrandir la photo de ${alt}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOuvert(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setOuvert(true);
          }
        }}
        className={`press relative ${taille} shrink-0 cursor-zoom-in overflow-hidden rounded-full ring-2 ring-border transition hover:ring-primary/60 active:scale-95 ${className}`}
      >
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </span>

      {ouvert && <Lightbox src={src} alt={alt} onClose={() => setOuvert(false)} />}
    </>
  );
}
