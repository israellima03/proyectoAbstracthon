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
