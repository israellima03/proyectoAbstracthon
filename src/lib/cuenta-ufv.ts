/**
 * Cuenta general en UFV (ahorro libre, sin un propósito específico).
 * Por ahora se guarda en localStorage; luego vendrá del backend.
 */
import type { CuentaUfv, MovimientoUfv } from "../types";

const CLAVE = "ufv:cuenta:v2";

/** Movimientos de ejemplo de los últimos meses (para que los gráficos tengan datos). */
const movimientosEjemplo: MovimientoUfv[] = [
  { tipo: "compra", ufv: 40, fecha: "2026-06-05T09:30:00" },
  { tipo: "compra", ufv: 25, fecha: "2026-07-04T12:10:00" },
  { tipo: "compra", ufv: 60, fecha: "2026-08-03T17:45:00" },
  { tipo: "retiro", ufv: 20, fecha: "2026-08-22T11:00:00" },
  { tipo: "compra", ufv: 35, fecha: "2026-09-06T08:20:00" },
  { tipo: "compra", ufv: 100, fecha: "2026-10-03T10:15:00" },
  { tipo: "compra", ufv: 42.5, fecha: "2026-11-02T18:40:00" },
];

export const cuentaInicial: CuentaUfv = {
  saldoUfv: movimientosEjemplo.reduce((acc, m) => acc + (m.tipo === "compra" ? m.ufv : -m.ufv), 0),
  movimientos: movimientosEjemplo,
};

export function cargarCuenta(): CuentaUfv {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado) as CuentaUfv;
  } catch {
    /* sin storage */
  }
  return structuredClone(cuentaInicial);
}

export function guardarCuenta(cuenta: CuentaUfv) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(cuenta));
  } catch {
    /* ignorar */
  }
}

export function reiniciarCuenta(): CuentaUfv {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* ignorar */
  }
  return structuredClone(cuentaInicial);
}
