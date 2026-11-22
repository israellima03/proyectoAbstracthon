/**
 * Utilidades de UFV compartidas (las usan Ahorro y UFVs).
 * TODO: reemplazar HISTORIAL_UFV por los valores oficiales del Banco Central de Bolivia.
 */

/**
 * Evolución de la UFV en los últimos meses (valores de ejemplo).
 * `mes` = "AAAA-MM". El último es el mes actual y su valor es la cotización de hoy.
 */
export const HISTORIAL_UFV = [
  { mes: "2026-06", etiqueta: "Jun", nombre: "junio", valor: 2.509 },
  { mes: "2026-07", etiqueta: "Jul", nombre: "julio", valor: 2.5152 },
  { mes: "2026-08", etiqueta: "Ago", nombre: "agosto", valor: 2.5214 },
  { mes: "2026-09", etiqueta: "Sep", nombre: "septiembre", valor: 2.5281 },
  { mes: "2026-10", etiqueta: "Oct", nombre: "octubre", valor: 2.5347 },
  { mes: "2026-11", etiqueta: "Nov", nombre: "noviembre", valor: 2.5418 },
] as const;

/** Bs por 1 UFV hoy. */
export const VALOR_UFV: number = HISTORIAL_UFV[HISTORIAL_UFV.length - 1].valor;

/**
 * Posición en HISTORIAL_UFV del mes de una fecha.
 * Fechas posteriores al último mes cuentan como el mes actual; anteriores devuelven -1.
 */
export function indiceMesUfv(fechaIso: string): number {
  const mes = fechaIso.slice(0, 7);
  if (mes < HISTORIAL_UFV[0].mes) return -1;
  const i = HISTORIAL_UFV.findIndex((p) => p.mes === mes);
  return i === -1 ? HISTORIAL_UFV.length - 1 : i;
}

/** Depósito mínimo para comprar UFV por QR. */
export const MINIMO_DEPOSITO_UFV = 30;

export const bsAUfv = (bs: number, valor = VALOR_UFV) => bs / valor;
export const ufvABs = (ufv: number, valor = VALOR_UFV) => ufv * valor;

const fmtBs = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtUfv = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCotizacion = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

/** 1500 → "Bs 1.500" */
export const formatoBs = (bs: number) => `Bs ${fmtBs.format(bs)}`;
/** 57.6923 → "57,69" */
export const formatoUfv = (ufv: number) => fmtUfv.format(ufv);
/** 2.5418 → "2,5418" */
export const formatoCotizacion = (valor: number) => fmtCotizacion.format(valor);
