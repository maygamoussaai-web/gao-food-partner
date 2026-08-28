import askia from "@/assets/askia.jpg";

/** Fond discret : photo du Tombeau des Askia (Gao) atténuée par un voile uni. */
export function AskiaBackground() {
  return (
    <div
      aria-hidden="true"
      className="bg-askia-layer"
      style={{ ["--askia-image" as string]: `url(${askia})` }}
    />
  );
}
