/**
 * Datos y dibujo del gráfico "Tu ahorro mes a mes":
 * - Barras: Bs depositados (comprados en UFV) cada mes.
 * - Línea: dinero ganado acumulado gracias a que la UFV sube.
 */
import { HISTORIAL_UFV, indiceMesUfv } from "../../lib/ufv";
import type { MovimientoUfv } from "../../types";

export interface DatoMensual {
  etiqueta: string;
  nombre: string;
  /** Bs depositados ese mes */
  ahorradoBs: number;
  /** Bs ganados acumulados hasta ese mes por la subida de la UFV */
  gananciaBs: number;
}

export function calcularAhorroMensual(movimientos: MovimientoUfv[]): DatoMensual[] {
  // UFV netas (compras - retiros) que entraron cada mes
  const compras = HISTORIAL_UFV.map(() => 0);
  const netas = HISTORIAL_UFV.map(() => 0);
  for (const m of movimientos) {
    const i = indiceMesUfv(m.fecha);
    if (i < 0) continue;
    if (m.tipo === "compra") compras[i] += m.ufv;
    netas[i] += m.tipo === "compra" ? m.ufv : -m.ufv;
  }

  return HISTORIAL_UFV.map((mes, k) => {
    // Lo que valen hoy (mes k) las UFV compradas antes, menos lo que costaron
    let ganancia = 0;
    for (let j = 0; j <= k; j++) ganancia += netas[j] * (mes.valor - HISTORIAL_UFV[j].valor);
    return {
      etiqueta: mes.etiqueta,
      nombre: mes.nombre,
      ahorradoBs: compras[k] * mes.valor,
      gananciaBs: Math.max(0, ganancia),
    };
  });
}

const fmt0 = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function svgGraficoAhorro(datos: DatoMensual[]): string {
  const ancho = 300;
  const alto = 170;
  const m = { x: 10, arriba: 20, abajo: 22 };
  const base = alto - m.abajo;
  const altoUtil = base - m.arriba;
  const banda = (ancho - m.x * 2) / datos.length;
  const anchoBarra = Math.min(28, banda * 0.6);

  const maxAhorro = Math.max(1, ...datos.map((d) => d.ahorradoBs));
  const maxGanancia = Math.max(0.01, ...datos.map((d) => d.gananciaBs));
  const iMejor = datos.reduce((mejor, d, i) => (d.ahorradoBs > datos[mejor].ahorradoBs ? i : mejor), 0);

  const centro = (i: number) => m.x + banda * i + banda / 2;
  // La línea usa su propia escala (la ganancia es mucho menor que lo ahorrado)
  const yGanancia = (g: number) => base - (g / maxGanancia) * altoUtil * 0.9;

  const barras = datos
    .map((d, i) => {
      const h = (d.ahorradoBs / maxAhorro) * (altoUtil - 12);
      const x = centro(i) - anchoBarra / 2;
      const color = i === iMejor && d.ahorradoBs > 0 ? "fill-accion" : "fill-primario";
      return `<g>
        <title>${d.nombre}: ahorraste Bs ${fmt2.format(d.ahorradoBs)}</title>
        <rect x="${x}" y="${base - h}" width="${anchoBarra}" height="${h}" rx="4" class="${color} stroke-tinta" stroke-width="2"/>
        ${d.ahorradoBs > 0 ? `<text x="${centro(i)}" y="${base - h - 4}" text-anchor="middle" class="fill-tinta text-[8px] font-bold">${fmt0.format(d.ahorradoBs)}</text>` : ""}
        <text x="${centro(i)}" y="${alto - 6}" text-anchor="middle" class="fill-tinta text-[9px] font-bold">${i === datos.length - 1 ? "Hoy" : d.etiqueta}</text>
      </g>`;
    })
    .join("");

  const linea = datos
    .map((d, i) => `${i ? "L" : "M"}${centro(i).toFixed(1)},${yGanancia(d.gananciaBs).toFixed(1)}`)
    .join(" ");
  const puntos = datos
    .map(
      (d, i) => `<circle cx="${centro(i)}" cy="${yGanancia(d.gananciaBs)}" r="3.5" class="fill-exito stroke-tinta" stroke-width="1.5">
        <title>${d.nombre}: ganaste Bs ${fmt2.format(d.gananciaBs)}</title></circle>`,
    )
    .join("");
  const ultimo = datos.at(-1)!;
  const etiquetaFinal = `<text x="${centro(datos.length - 1)}" y="${yGanancia(ultimo.gananciaBs) - 7}" text-anchor="end" class="fill-exito text-[8px] font-extrabold">+Bs ${fmt2.format(ultimo.gananciaBs)}</text>`;

  return `<svg viewBox="0 0 ${ancho} ${alto}" class="w-full" role="img" aria-label="Ahorro mensual en barras y dinero ganado por la UFV en línea">
    <line x1="${m.x}" x2="${ancho - m.x}" y1="${base}" y2="${base}" class="stroke-tinta" stroke-width="1.5"/>
    ${barras}
    <path d="${linea}" fill="none" class="stroke-exito" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0"/>
    ${puntos}
    ${etiquetaFinal}
  </svg>`;
}
