/** Utilidades de formato del perfil (sirven en el servidor y en el navegador). */

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
