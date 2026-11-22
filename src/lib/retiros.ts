/**
 * Límite de retiros del ahorro en UFV: máximo 4 por mes.
 * Se comparte entre la cuenta general (UFVs) y las subcuentas (Ahorro).
 * Por ahora se cuenta en localStorage; luego lo debe controlar el backend.
 */
export const MAX_RETIROS_MES = 4;

function claveMes(fecha = new Date()): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `retiros:${fecha.getFullYear()}-${mes}`;
}

export function retirosUsados(): number {
  try {
    return Number(localStorage.getItem(claveMes())) || 0;
  } catch {
    return 0;
  }
}

export const retirosRestantes = () => Math.max(0, MAX_RETIROS_MES - retirosUsados());

/** Registra un retiro y devuelve cuántos quedan este mes. */
export function registrarRetiro(): number {
  const usados = Math.min(MAX_RETIROS_MES, retirosUsados() + 1);
  try {
    localStorage.setItem(claveMes(), String(usados));
  } catch {
    /* ignorar */
  }
  return MAX_RETIROS_MES - usados;
}

export function reiniciarRetiros() {
  try {
    localStorage.removeItem(claveMes());
  } catch {
    /* ignorar */
  }
}

/** Texto para avisar cuántas oportunidades quedan. */
export function textoRetirosRestantes(restantes = retirosRestantes()): string {
  if (restantes === 0) return "Ya usaste tus 4 retiros de este mes. Podrás retirar de nuevo el próximo mes.";
  if (restantes === 1) return "Te queda 1 sola oportunidad de retiro este mes.";
  return `Te quedan ${restantes} de ${MAX_RETIROS_MES} retiros este mes.`;
}

export const RECORDATORIO_RETIROS = `Recuerda: tu ahorro en UFV solo se puede retirar ${MAX_RETIROS_MES} veces al mes.`;
