import { useEffect, useState } from "react";

/**
 * Renvoie le style à appliquer à l'overlay d'une feuille modale pour qu'elle
 * reste TOUJOURS entièrement visible sur mobile, clavier ouvert compris.
 *
 * Sur Android, l'ouverture du clavier ne réduit pas systématiquement les
 * unités CSS (dvh/svh) : le bas de la feuille — donc les boutons d'action —
 * se retrouve caché derrière le clavier. On s'appuie donc sur visualViewport,
 * qui donne la zone réellement visible, et on y ancre la feuille.
 */
export function useViewportSheetStyle(): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const maj = () => {
      setStyle({
        position: "fixed",
        left: 0,
        right: 0,
        top: `${vv.offsetTop}px`,
        height: `${vv.height}px`,
      });
    };

    maj();
    vv.addEventListener("resize", maj);
    vv.addEventListener("scroll", maj);
    return () => {
      vv.removeEventListener("resize", maj);
      vv.removeEventListener("scroll", maj);
    };
  }, []);

  return style;
}
