import type { SubcuentaAhorro } from "../types";
import { bsAUfv } from "../lib/ufv";

/** Ingreso de ejemplo con el que arranca la demo. */
export const INGRESO_DEMO = 3000;

/** Porcentaje que sugiere el sistema en cada ingreso. */
export const PORCENTAJE_SUGERIDO = 5;
export const PORCENTAJES_RAPIDOS = [3, 5, 10, 15] as const;
export const PORCENTAJE_MIN = 1;
export const PORCENTAJE_MAX = 50;

/** Subcuentas de ejemplo (luego vendrán del backend). */
export const subcuentasIniciales: SubcuentaAhorro[] = [
  {
    id: "luz",
    nombre: "Servicio de luz",
    detalle: "Factura de DELAPAZ / CRE",
    icono: "luz",
    tipo: "servicio",
    objetivoBs: 190,
    ahorradoUfv: bsAUfv(133),
  },
  {
    id: "agua",
    nombre: "Servicio de agua",
    detalle: "Factura mensual",
    icono: "agua",
    tipo: "servicio",
    objetivoBs: 85,
    ahorradoUfv: bsAUfv(85),
  },
  {
    id: "viaje",
    nombre: "Viaje de fin de año",
    detalle: "Vacaciones de diciembre",
    icono: "viaje",
    tipo: "meta",
    objetivoBs: 4000,
    ahorradoUfv: bsAUfv(1650),
  },
  {
    id: "comida",
    nombre: "Comida semanal",
    detalle: "Mercado y almuerzos",
    icono: "comida",
    tipo: "servicio",
    objetivoBs: 600,
    ahorradoUfv: bsAUfv(270),
  },
];
