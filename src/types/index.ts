import type { NombreIcono } from "../components/ui/iconos";

/** Un elemento de la barra de navegación inferior. */
export interface ItemNavegacion {
  etiqueta: string;
  href: string;
  icono: NombreIcono;
}

/** Un mensaje del chat con la mascota. */
export interface MensajeChat {
  autor: "usuario" | "bot";
  texto: string;
}
