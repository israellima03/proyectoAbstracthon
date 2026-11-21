/**
 * Estado del perfil en el navegador. Parte de la racha compartida (src/lib/racha.ts),
 * así que refleja las compras de UFV hechas en la pestaña UFVs.
 * Los componentes se suscriben con `alCambiar` y se repintan solos.
 */
import { premios, racha } from "../../data/perfil";
import { cargarRacha, completarReto, guardarRacha, type EstadoRacha } from "../../lib/racha";

export interface EstadoPerfil extends EstadoRacha {
  /** Bs por día que pide la racha (sale del plan de Inicio si existe). */
  montoDiario: number;
}

/** Plan mensual que se arma en Inicio (PlanificarMesModal lo guarda en esta clave). */
function leerPlanDeInicio(): { ahorroMeta: number } | null {
  try {
    const guardado = localStorage.getItem("ufv_plan_mensual");
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

const plan = leerPlanDeInicio();
const guardado = cargarRacha();

export const estado: EstadoPerfil = {
  ...guardado,
  montoDiario: plan?.ahorroMeta ? Math.max(1, Math.round(plan.ahorroMeta / 30)) : racha.montoDiario,
};
if (plan) completarReto(estado, "plan-mes", false);

type Oyente = (e: EstadoPerfil) => void;
const oyentes = new Set<Oyente>();

export function alCambiar(fn: Oyente) {
  oyentes.add(fn);
  fn(estado);
}

function notificar() {
  guardarRacha(estado);
  oyentes.forEach((fn) => fn(estado));
}

export function canjear(id: string) {
  const premio = premios.find((p) => p.id === id);
  if (!premio || estado.puntos < premio.costo) return null;
  estado.puntos -= premio.costo;
  notificar();
  return premio;
}
