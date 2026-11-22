/**
 * Racha de ahorro compartida entre pantallas (idea 6).
 * - Perfil la muestra (días, puntos, retos, recompensas).
 * - UFVs la alimenta: cada compra de UFV cuenta como el ahorro del día.
 *
 * Regla: cada día se ahorra el monto del plan o se compra al menos 1 UFV.
 * Si ayer se falló, hay 24 h para recuperarla cubriendo lo de ayer + lo de hoy.
 * Los puntos se ganan por constancia, no por monto.
 *
 * Por ahora se guarda en localStorage; luego vendrá del backend.
 */
import { racha as inicial, retos } from "../data/perfil";

const CLAVE = "racha:estado:v1";

export interface EstadoRacha {
  puntos: number;
  dias: number;
  ayerCumplido: boolean;
  hoyCumplido: boolean;
  retosListos: string[];
}

/** Días de racha que dan puntos extra al alcanzarlos. */
export const HITOS: [dia: number, puntos: number][] = [
  [7, 50],
  [14, 100],
  [30, 300],
  [60, 600],
  [100, 1000],
];

export function nivelRacha(dias: number): string {
  if (dias >= 30) return "Nivel Oro";
  if (dias >= 7) return "Nivel Plata";
  return "Nivel Bronce";
}

export function siguienteHito(dias: number) {
  const [dia, puntos] = HITOS.find(([d]) => d > dias) ?? [dias + 30, 300];
  return { dia, puntos, faltan: dia - dias, avance: Math.min(dias / dia, 1) };
}

/** Puntos de bonus por los hitos cruzados al pasar de `antes` a `despues` días. */
export function bonusHitos(antes: number, despues: number): number {
  return HITOS.filter(([d]) => d > antes && d <= despues).reduce((t, [, p]) => t + p, 0);
}

function estadoInicial(): EstadoRacha {
  return {
    puntos: inicial.puntos,
    dias: inicial.dias,
    ayerCumplido: inicial.ayerCumplido,
    hoyCumplido: inicial.hoyCumplido,
    retosListos: retos.filter((r) => r.listo).map((r) => r.id),
  };
}

export function cargarRacha(): EstadoRacha {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return { ...estadoInicial(), ...JSON.parse(guardado) };
  } catch {
    /* sin storage: datos de ejemplo */
  }
  return estadoInicial();
}

export function guardarRacha({ puntos, dias, ayerCumplido, hoyCumplido, retosListos }: EstadoRacha) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ puntos, dias, ayerCumplido, hoyCumplido, retosListos }));
  } catch {
    /* ignorar */
  }
}

export function reiniciarRacha() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* ignorar */
  }
}

/** Marca un reto como hecho sobre `estado`. Devuelve los puntos ganados. */
export function completarReto(estado: EstadoRacha, id: string, darPuntos = true): number {
  if (estado.retosListos.includes(id)) return 0;
  const puntos = darPuntos ? (retos.find((r) => r.id === id)?.puntos ?? 0) : 0;
  estado.retosListos = [...estado.retosListos, id];
  estado.puntos += puntos;
  return puntos;
}

export interface ResultadoAhorroDia {
  recupera: boolean;
  diasSumados: number;
  dias: number;
  bonus: number;
  puntos: number;
}

/** Compra de UFV en la pestaña UFVs: completa el reto de transferir y cuenta como ahorro del día. */
export function registrarCompraUfv(ufv: number): ResultadoAhorroDia | null {
  return registrarAhorroDelDia(ufv, "transferir-ufv");
}

/** Ahorro de un % de un ingreso en la pestaña Ahorro (va a una subcuenta en UFV). */
export function registrarAhorroSubcuenta(ufv: number): ResultadoAhorroDia | null {
  return registrarAhorroDelDia(ufv);
}

/**
 * Registra un ahorro en UFV como el ahorro del día.
 * `retoExtra` se completa siempre (aunque hoy ya estuviera cubierto).
 * Devuelve null si hoy ya estaba cubierto o el monto no alcanza.
 */
function registrarAhorroDelDia(ufv: number, retoExtra?: string): ResultadoAhorroDia | null {
  const estado = cargarRacha();
  const puntosTransferir = retoExtra ? completarReto(estado, retoExtra) : 0;
  const recupera = !estado.ayerCumplido;
  const diasSumados = recupera ? 2 : 1;

  // 1 UFV por día como mínimo (el depósito mínimo de 30 UFV siempre lo cubre)
  if (estado.hoyCumplido || ufv < diasSumados) {
    guardarRacha(estado);
    return null;
  }

  const antes = estado.dias;
  estado.dias += diasSumados;
  estado.ayerCumplido = true;
  estado.hoyCumplido = true;
  const bonus = bonusHitos(antes, estado.dias);
  estado.puntos += inicial.puntosPorDia * diasSumados + bonus;
  const puntosReto = completarReto(estado, "ahorro-hoy");
  guardarRacha(estado);

  return {
    recupera,
    diasSumados,
    dias: estado.dias,
    bonus,
    puntos: inicial.puntosPorDia * diasSumados + bonus + puntosReto + puntosTransferir,
  };
}
