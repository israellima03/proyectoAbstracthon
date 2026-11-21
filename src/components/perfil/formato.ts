/** Utilidades de formato y reglas de la racha (sirven en el servidor y en el navegador). */

/** 1250 → "1.250" (separador de miles boliviano). */
export function miles(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 5400 → "Bs 5.400" */
export function bs(n: number): string {
  return `Bs ${miles(n)}`;
}

export function nivelRacha(dias: number): string {
  if (dias >= 30) return "Nivel Oro";
  if (dias >= 7) return "Nivel Plata";
  return "Nivel Bronce";
}

/** Días de racha que dan puntos extra al alcanzarlos. */
export const HITOS: [dia: number, puntos: number][] = [
  [7, 50],
  [14, 100],
  [30, 300],
  [60, 600],
  [100, 1000],
];

export function siguienteHito(dias: number) {
  const [dia, puntos] = HITOS.find(([d]) => d > dias) ?? [dias + 30, 300];
  return { dia, puntos, faltan: dia - dias, avance: Math.min(dias / dia, 1) };
}

/** Puntos de bonus por los hitos cruzados al pasar de `antes` a `despues` días. */
export function bonusHitos(antes: number, despues: number): number {
  return HITOS.filter(([d]) => d > antes && d <= despues).reduce((t, [, p]) => t + p, 0);
}
