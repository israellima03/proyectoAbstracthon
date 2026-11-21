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

/* ---------- Perfil y racha ---------- */

/** Estado de un día en la semana de la racha. */
export type EstadoDia = "hecho" | "fallo" | "hoy" | "pendiente";

export interface DiaRacha {
  letra: string;
  estado: EstadoDia;
}

/** Qué pasa al tocar el botón de un reto. */
export type AccionReto =
  | { tipo: "ahorrar" }
  | { tipo: "hoja"; hoja: string }
  | { tipo: "enlace"; href: string };

export interface Reto {
  id: string;
  titulo: string;
  detalle?: string;
  puntos: number;
  icono: NombreIcono;
  listo?: boolean;
  accion: AccionReto;
}

/** Premio que se canjea con los puntos de la racha. */
export interface Premio {
  id: string;
  titulo: string;
  detalle: string;
  costo: number;
  icono: NombreIcono;
  mensaje: string;
}

/** Formulario de gastos fijos del mes (en Bs). */
export interface GastosFijos {
  sueldo: number;
  diaCobro: number;
  pagaAlquiler: boolean;
  alquiler: number;
  luz: number;
  agua: number;
  gas: number;
  internet: number;
  suscripciones: number;
  transporte: number;
  dependientes: number;
  gastoDependientes: number;
  otros: number;
}

export interface AjustesSeguridad {
  pin: boolean;
  biometria: boolean;
  pinEnPagos: boolean;
  alertasSesion: boolean;
}
