/**
 * Estado del perfil en el navegador (puntos, racha y retos).
 * Los componentes se suscriben con `alCambiar` y se repintan solos.
 */
import { premios, racha, retos } from "../../data/perfil";
import { bonusHitos } from "./formato";

export interface EstadoPerfil {
  puntos: number;
  dias: number;
  ayerCumplido: boolean;
  hoyCumplido: boolean;
  montoDiario: number;
  retosListos: string[];
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

export const estado: EstadoPerfil = {
  puntos: racha.puntos,
  dias: racha.dias,
  ayerCumplido: racha.ayerCumplido,
  hoyCumplido: racha.hoyCumplido,
  // Con plan activo, el monto diario de la racha es su ahorro del mes repartido en 30 días
  montoDiario: plan?.ahorroMeta ? Math.max(1, Math.round(plan.ahorroMeta / 30)) : racha.montoDiario,
  retosListos: [...retos.filter((r) => r.listo).map((r) => r.id), ...(plan ? ["plan-mes"] : [])],
};

type Oyente = (e: EstadoPerfil) => void;
const oyentes = new Set<Oyente>();

export function alCambiar(fn: Oyente) {
  oyentes.add(fn);
  fn(estado);
}

function notificar() {
  oyentes.forEach((fn) => fn(estado));
}

export function actualizar(cambios: Partial<EstadoPerfil>) {
  Object.assign(estado, cambios);
  notificar();
}

/** Marca un reto como hecho. Devuelve los puntos ganados. */
export function marcarReto(id: string, darPuntos = true): number {
  if (estado.retosListos.includes(id)) return 0;
  const puntos = darPuntos ? (retos.find((r) => r.id === id)?.puntos ?? 0) : 0;
  estado.retosListos = [...estado.retosListos, id];
  estado.puntos += puntos;
  notificar();
  return puntos;
}

/**
 * Deposita el monto del día. Si ayer falló, recupera la racha
 * cobrando lo de ayer + lo de hoy.
 */
export function ahorrarHoy() {
  if (estado.hoyCumplido) return null;
  const recupera = !estado.ayerCumplido;
  const diasSumados = recupera ? 2 : 1;
  const monto = estado.montoDiario * diasSumados;
  const antes = estado.dias;

  estado.dias += diasSumados;
  estado.ayerCumplido = true;
  estado.hoyCumplido = true;
  const bonus = bonusHitos(antes, estado.dias);
  estado.puntos += racha.puntosPorDia * diasSumados + bonus;

  const puntosReto = marcarReto("ahorro-hoy"); // también notifica
  return {
    monto,
    recupera,
    bonus,
    puntos: racha.puntosPorDia * diasSumados + bonus + puntosReto,
  };
}

export function canjear(id: string) {
  const premio = premios.find((p) => p.id === id);
  if (!premio || estado.puntos < premio.costo) return null;
  estado.puntos -= premio.costo;
  notificar();
  return premio;
}
