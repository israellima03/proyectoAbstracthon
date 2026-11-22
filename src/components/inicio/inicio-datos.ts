/**
 * Llena las tarjetas de Inicio con los datos reales de las otras pestañas:
 * - Cuenta de Ahorro → saldo de Pagos (lib/pagosStore)
 * - Caja Virtual Hormiga → subcuentas de servicios de Ahorro
 * - Mis UFVs → cuenta en UFV (lib/cuenta-ufv)
 * - Chip del plan → plan mensual guardado por PlanificarMesModal
 */
import type { SubcuentaAhorro } from "../../types";
import { subcuentasIniciales } from "../../data/ahorro";
import { cargarCuenta } from "../../lib/cuenta-ufv";
import { getSaldo } from "../../lib/pagosStore";
import { HISTORIAL_UFV, VALOR_UFV, formatoCotizacion, formatoUfv, ufvABs } from "../../lib/ufv";

const $ = (id: string) => document.getElementById(id);

/** 3450 → "Bs 3.450,00" */
function bs2(n: number): string {
  const [entero, decimales] = Math.max(0, n).toFixed(2).split(".");
  return `Bs ${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimales}`;
}

function leerJson<T>(clave: string, porDefecto: T): T {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? (JSON.parse(valor) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function pintarPlan() {
  const chip = $("inicio-plan-chip");
  if (!chip) return;
  const plan = leerJson<unknown>("ufv_plan_mensual", null);
  chip.textContent = plan ? "Plan activo" : "Sin plan";
  chip.classList.toggle("opacity-60", !plan);
}

function pintarHormiga() {
  const subcuentas = leerJson<SubcuentaAhorro[]>("ahorro:subcuentas:v1", subcuentasIniciales);
  const servicios = subcuentas.filter((s) => s.tipo === "servicio");
  const ahorradoBs = (s: SubcuentaAhorro) => ufvABs(s.ahorradoUfv);
  const lista = (s: SubcuentaAhorro) => ahorradoBs(s) >= s.objetivoBs - 0.01;
  const etiqueta = (s: SubcuentaAhorro) => {
    const corto = s.nombre.replace(/^servicio de\s+/i, "").split(" ")[0];
    return corto.charAt(0).toUpperCase() + corto.slice(1);
  };

  $("inicio-hormiga-total")!.textContent = bs2(servicios.reduce((t, s) => t + ahorradoBs(s), 0));
  $("inicio-hormiga-cantidad")!.textContent = `${servicios.length} subcuentas activas`;

  const primeraLista = servicios.find(lista);
  const chip = $("inicio-hormiga-chip")!;
  chip.hidden = !primeraLista;
  if (primeraLista) chip.textContent = `${etiqueta(primeraLista)} lista`;

  const contenedor = $("inicio-hormiga-lista")!;
  const visibles = servicios.slice(0, 3);
  contenedor.style.gridTemplateColumns = `repeat(${Math.max(visibles.length, 1)}, minmax(0, 1fr))`;
  contenedor.replaceChildren(
    ...visibles.map((s) => {
      const celda = document.createElement("div");
      const nombre = document.createElement("p");
      nombre.className = "text-xs text-[#1E1B4B]/75";
      nombre.textContent = etiqueta(s);
      const monto = document.createElement("p");
      monto.className = `mt-0.5 font-mono text-sm font-bold ${lista(s) ? "text-emerald-700" : "text-[#1E1B4B]"}`;
      monto.textContent = `Bs ${Math.round(ahorradoBs(s))}`;
      celda.append(nombre, monto);
      return celda;
    }),
  );
}

function pintarUfv() {
  const { saldoUfv } = cargarCuenta();
  const subida = (VALOR_UFV / HISTORIAL_UFV[0].valor - 1) * 100;
  $("inicio-ufv-saldo")!.textContent = `${formatoUfv(saldoUfv)} UFV`;
  $("inicio-ufv-bs")!.textContent = `≈ ${bs2(ufvABs(saldoUfv))}`;
  $("inicio-ufv-valor")!.textContent = `1 UFV = Bs ${formatoCotizacion(VALOR_UFV)} hoy`;
  $("inicio-ufv-subida")!.textContent = `+${subida.toFixed(2).replace(".", ",")}%`;
}

export function iniciarDatosInicio() {
  $("inicio-saldo")!.textContent = bs2(getSaldo());
  pintarPlan();
  pintarHormiga();
  pintarUfv();
  // El modal de "Planificar mes" avisa cuando se activa un plan
  window.addEventListener("plan-mensual-activado", pintarPlan);
}
