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

/** Tipos de recompensa de la racha (idea 6). */
export type CategoriaPremio = "megas" | "descuentos" | "ufv";

/** Premio que se canjea con los puntos de la racha. */
export interface Premio {
  id: string;
  titulo: string;
  detalle: string;
  costo: number;
  icono: NombreIcono;
  categoria: CategoriaPremio;
  mensaje: string;
}

export interface AjustesSeguridad {
  pin: boolean;
  biometria: boolean;
  pinEnPagos: boolean;
  alertasSesion: boolean;
}

/**
 * Subcuenta de ahorro en UFV.
 * - "servicio": se paga cuando llega al 100% (luz, agua...)
 * - "meta": un objetivo personal (viaje, emergencias...)
 */
export interface SubcuentaAhorro {
  id: string;
  nombre: string;
  detalle: string;
  icono: NombreIcono;
  tipo: "servicio" | "meta";
  /** Monto a juntar, en Bs */
  objetivoBs: number;
  /** Lo ahorrado, guardado en UFV para protegerlo de la inflación */
  ahorradoUfv: number;
}

/** Movimiento de la cuenta general en UFV. */
export interface MovimientoUfv {
  tipo: "compra" | "retiro";
  ufv: number;
  /** Fecha ISO */
  fecha: string;
}

export interface CuentaUfv {
  saldoUfv: number;
  movimientos: MovimientoUfv[];
}
