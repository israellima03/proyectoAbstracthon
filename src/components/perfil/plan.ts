import type { GastosFijos } from "../../types";

/**
 * Arma el plan del mes a partir de los gastos fijos (idea 1):
 * cuánto se va en fijos, cuánto conviene ahorrar y cuánto queda por día.
 */
export function calcularPlan(g: GastosFijos) {
  const fijos =
    (g.pagaAlquiler ? g.alquiler : 0) +
    g.luz +
    g.agua +
    g.gas +
    g.internet +
    g.suscripciones +
    g.transporte +
    (g.dependientes > 0 ? g.gastoDependientes : 0) +
    g.otros;

  const libre = g.sueldo - fijos;
  const holgura = g.sueldo > 0 ? libre / g.sueldo : 0;

  // Mientras más margen, más se sugiere ahorrar.
  const tasa = libre <= 0 ? 0 : holgura >= 0.4 ? 0.15 : holgura >= 0.2 ? 0.1 : 0.05;
  const ahorro = Math.min(Math.round(g.sueldo * tasa), Math.max(libre, 0));
  const gastoLibre = Math.max(libre - ahorro, 0);

  return {
    fijos,
    libre,
    tasa,
    ahorro,
    gastoLibre,
    /** Para gastar cada día sin pasarse. */
    porDia: Math.floor(gastoLibre / 30),
    /** Monto diario que alimenta la racha. */
    ahorroDiario: Math.max(1, Math.round(ahorro / 30)),
  };
}
