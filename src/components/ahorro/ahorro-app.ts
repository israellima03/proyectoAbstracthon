/**
 * Lógica de la pantalla de Ahorro (se ejecuta en el navegador).
 * Por ahora guarda los datos en localStorage; luego se cambia por el backend.
 * Los retiros NO se hacen en la app (se hacen en la entidad bancaria).
 */
import {
  INGRESO_DEMO,
  PORCENTAJE_MAX,
  PORCENTAJE_MIN,
  PORCENTAJE_SUGERIDO,
  subcuentasIniciales,
} from "../../data/ahorro";
import { mostrarAviso } from "../../lib/aviso";
import { registrarAhorroSubcuenta } from "../../lib/racha";
import { cargarCuenta } from "../../lib/cuenta-ufv";
import { RECORDATORIO_RETIROS } from "../../lib/retiros";
import { bsAUfv, formatoBs, formatoUfv, ufvABs } from "../../lib/ufv";
import type { MovimientoUfv, SubcuentaAhorro } from "../../types";
import { svgIcono } from "../ui/iconos";
import { calcularAhorroMensual, svgGraficoAhorro } from "./grafico-ahorro";

const CLAVE_SUBCUENTAS = "ahorro:subcuentas:v1";
/** Historial de lo que se va ahorrando en las metas (para el gráfico mensual). */
const CLAVE_APORTES = "ahorro:aportes:v1";

// ---------- Estado ----------
interface Estado {
  subcuentas: SubcuentaAhorro[];
  aportes: MovimientoUfv[];
  /** Ingreso pendiente de decidir (null = no hay sugerencia) */
  ingreso: number | null;
  porcentaje: number;
}

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado) return JSON.parse(guardado) as T;
  } catch {
    /* sin storage: usamos los datos de ejemplo */
  }
  return structuredClone(porDefecto);
}

function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* ignorar */
  }
}

function borrar(...claves: string[]) {
  try {
    claves.forEach((c) => localStorage.removeItem(c));
  } catch {
    /* ignorar */
  }
}

// ---------- Cálculos ----------
const ahorradoBs = (s: SubcuentaAhorro) => ufvABs(s.ahorradoUfv);
const progreso = (s: SubcuentaAhorro) => Math.min(100, (ahorradoBs(s) / s.objetivoBs) * 100);
const faltaBs = (s: SubcuentaAhorro) => Math.max(0, s.objetivoBs - ahorradoBs(s));
const estaLista = (s: SubcuentaAhorro) => faltaBs(s) < 0.01;
const redondear = (n: number) => Math.round(n * 100) / 100;

// ---------- Helpers DOM ----------
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

function escapar(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function colorChip(pct: number): string {
  if (pct >= 100) return "bg-exito-suave text-exito";
  if (pct >= 50) return "bg-primario-suave text-primario";
  return "bg-alerta-suave";
}

function tarjetaSubcuenta(s: SubcuentaAhorro): string {
  const pct = progreso(s);
  const lista = estaLista(s);
  const fondoIcono = s.tipo === "servicio" ? "bg-primario-suave text-primario" : "bg-alerta-suave text-tinta";
  const textoAccion = s.tipo === "servicio" ? `Pagar ${escapar(s.nombre.toLowerCase())} ahora` : "Usar mi ahorro";

  return `
  <article class="tarjeta p-4" data-id="${s.id}">
    <div class="flex items-start gap-3">
      <div class="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-tinta ${fondoIcono}">
        ${svgIcono(s.icono, "size-5")}
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="truncate font-bold">${escapar(s.nombre)}</h3>
        <p class="text-xs text-tinta-suave">${formatoBs(Math.round(ahorradoBs(s)))} / ${formatoBs(s.objetivoBs)}
          <span class="whitespace-nowrap">(${formatoUfv(s.ahorradoUfv)} UFV)</span></p>
      </div>
      <span class="chip shrink-0 ${colorChip(pct)}">${lista ? `${svgIcono("check", "size-3", 3)} Lista` : `${Math.floor(pct)}%`}</span>
    </div>

    <div class="mt-3 h-3 overflow-hidden rounded-full border-2 border-tinta bg-fondo">
      <div class="h-full transition-all duration-500 ${lista ? "bg-exito" : "bg-primario"}" style="width:${pct}%"></div>
    </div>

    <div class="mt-2 flex items-center justify-between gap-2 text-xs">
      ${
        lista
          ? `<span class="flex items-center gap-1 font-semibold text-exito">${svgIcono("trofeo", "size-3.5")} ¡Meta cumplida!</span>`
          : `<span class="flex items-center gap-1 font-semibold text-primario">${svgIcono("objetivo", "size-3.5")} Te faltan ${formatoBs(Math.ceil(faltaBs(s)))}</span>`
      }
      <span class="text-tinta-suave">Meta: ${formatoUfv(bsAUfv(s.objetivoBs))} UFV</span>
    </div>

    ${
      lista
        ? `<button type="button" data-pagar="${s.id}"
            class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-tinta bg-exito py-2.5 text-sm font-bold text-white shadow-duro-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
            ${svgIcono("listo", "size-4")} ${textoAccion}
          </button>`
        : ""
    }
  </article>`;
}

// ---------- App ----------
export function iniciarAhorro() {
  const estado: Estado = {
    subcuentas: leer(CLAVE_SUBCUENTAS, subcuentasIniciales),
    aportes: leer<MovimientoUfv[]>(CLAVE_APORTES, []),
    ingreso: INGRESO_DEMO, // la demo arranca con un ingreso recibido
    porcentaje: PORCENTAJE_SUGERIDO,
  };

  function renderResumen() {
    const totalUfv = estado.subcuentas.reduce((acc, s) => acc + s.ahorradoUfv, 0);
    const objetivo = estado.subcuentas.reduce((acc, s) => acc + s.objetivoBs, 0);
    const juntado = estado.subcuentas.reduce((acc, s) => acc + Math.min(ahorradoBs(s), s.objetivoBs), 0);
    const pct = objetivo ? (juntado / objetivo) * 100 : 0;

    $("total-ufv").textContent = formatoUfv(totalUfv);
    $("total-bs").textContent = formatoBs(Math.round(ufvABs(totalUfv)));
    $("total-barra").style.width = `${pct}%`;
    $("total-progreso").textContent = `${Math.floor(pct)}%`;
  }

  /** Gráfico mensual: cuenta UFV + lo ahorrado en las metas. */
  function renderGrafico() {
    const movimientos = [...cargarCuenta().movimientos, ...estado.aportes];
    const datos = calcularAhorroMensual(movimientos);
    const mejor = datos.reduce((a, b) => (b.ahorradoBs > a.ahorradoBs ? b : a));
    $("ga-svg").innerHTML = svgGraficoAhorro(datos);
    $("ga-mejor-mes").textContent = mejor.ahorradoBs > 0 ? mejor.nombre : "—";
    $("ga-mejor-monto").textContent = formatoBs(redondear(mejor.ahorradoBs));
    $("ga-ganancia").textContent = `+Bs ${formatoUfv(datos.at(-1)!.gananciaBs)}`;
  }

  function renderSubcuentas() {
    $("lista-subcuentas").innerHTML = estado.subcuentas.map(tarjetaSubcuenta).join("");

    // Selector de destino (mantiene la opción elegida)
    const select = $<HTMLSelectElement>("sug-destino");
    const anterior = select.value;
    select.innerHTML = estado.subcuentas
      .map((s) => `<option value="${s.id}">${escapar(s.nombre)} · ${Math.floor(progreso(s))}%</option>`)
      .join("");
    const porDefecto = estado.subcuentas.find((s) => !estaLista(s)) ?? estado.subcuentas[0];
    select.value = estado.subcuentas.some((s) => s.id === anterior) ? anterior : (porDefecto?.id ?? "");
  }

  function renderSugerencia() {
    const hayIngreso = estado.ingreso !== null;
    $("sugerencia").classList.toggle("hidden", !hayIngreso);
    $("form-ingreso").classList.toggle("hidden", hayIngreso);
    if (!hayIngreso) return;

    const montoBs = redondear((estado.ingreso! * estado.porcentaje) / 100);
    $("sug-ingreso").textContent = `+${formatoBs(estado.ingreso!)}`;
    $("sug-porcentaje").textContent = `${estado.porcentaje}%`;
    $("sug-porcentaje-titulo").textContent = `${estado.porcentaje}%`;
    $("sug-monto-bs").textContent = formatoBs(montoBs);
    $("sug-monto-ufv").textContent = formatoUfv(bsAUfv(montoBs));
    $("sug-guardar-texto").textContent = `Ahorrar ${formatoBs(montoBs)}`;
    $<HTMLButtonElement>("sug-menos").disabled = estado.porcentaje <= PORCENTAJE_MIN;
    $<HTMLButtonElement>("sug-mas").disabled = estado.porcentaje >= PORCENTAJE_MAX;

    document.querySelectorAll<HTMLButtonElement>("[data-pct]").forEach((b) => {
      const activo = Number(b.dataset.pct) === estado.porcentaje;
      b.classList.toggle("bg-primario", activo);
      b.classList.toggle("text-white", activo);
      b.classList.toggle("bg-superficie", !activo);
    });
  }

  function render() {
    renderResumen();
    renderGrafico();
    renderSubcuentas();
    renderSugerencia();
  }

  function cambiarPorcentaje(nuevo: number) {
    estado.porcentaje = Math.min(PORCENTAJE_MAX, Math.max(PORCENTAJE_MIN, nuevo));
    renderSugerencia();
  }

  // --- Eventos: sugerencia ---
  $("sug-menos").addEventListener("click", () => cambiarPorcentaje(estado.porcentaje - 1));
  $("sug-mas").addEventListener("click", () => cambiarPorcentaje(estado.porcentaje + 1));
  document
    .querySelectorAll<HTMLButtonElement>("[data-pct]")
    .forEach((b) => b.addEventListener("click", () => cambiarPorcentaje(Number(b.dataset.pct))));

  $("sug-guardar").addEventListener("click", () => {
    if (estado.ingreso === null) return;
    const destino = estado.subcuentas.find((s) => s.id === $<HTMLSelectElement>("sug-destino").value);
    if (!destino) return;

    const montoBs = redondear((estado.ingreso * estado.porcentaje) / 100);
    const montoUfv = bsAUfv(montoBs);
    destino.ahorradoUfv += montoUfv;
    estado.aportes.push({ tipo: "compra", ufv: montoUfv, fecha: new Date().toISOString() });
    escribir(CLAVE_SUBCUENTAS, estado.subcuentas);
    escribir(CLAVE_APORTES, estado.aportes);

    estado.ingreso = null;
    estado.porcentaje = PORCENTAJE_SUGERIDO;
    render();

    // Ahorrar en una subcuenta cuenta como el ahorro del día de la racha (ver src/lib/racha.ts)
    const racha = registrarAhorroSubcuenta(montoUfv);
    const textoRacha = racha
      ? `${racha.recupera ? "Recuperaste tu racha" : "Racha al día"}: ${racha.dias} días · +${racha.puntos} pts. `
      : "";
    mostrarAviso(textoRacha + RECORDATORIO_RETIROS, {
      tipo: "exito",
      icono: estaLista(destino) ? "trofeo" : "ahorro",
      titulo: estaLista(destino)
        ? `¡${destino.nombre} llegó al 100%!`
        : `¡Ahorraste ${formatoUfv(montoUfv)} UFV en ${destino.nombre}!`,
    });
  });

  $("sug-omitir").addEventListener("click", () => {
    estado.ingreso = null;
    estado.porcentaje = PORCENTAJE_SUGERIDO;
    renderSugerencia();
  });

  // --- Eventos: registrar ingreso ---
  $<HTMLFormElement>("form-ingreso").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $<HTMLInputElement>("ingreso-monto");
    const monto = Number(input.value);
    if (!(monto > 0)) return;
    estado.ingreso = monto;
    input.value = "";
    renderSugerencia();
    $("sugerencia").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // --- Pagar un servicio / usar una meta que llegó al 100% ---
  $("lista-subcuentas").addEventListener("click", (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pagar]");
    if (!boton) return;
    const s = estado.subcuentas.find((x) => x.id === boton.dataset.pagar);
    if (!s) return;
    // Se descuenta lo que cuesta; si sobró algo queda para el próximo mes
    s.ahorradoUfv = Math.max(0, s.ahorradoUfv - bsAUfv(s.objetivoBs));
    escribir(CLAVE_SUBCUENTAS, estado.subcuentas);
    render();
    mostrarAviso(
      s.tipo === "servicio"
        ? `Pagaste ${s.nombre.toLowerCase()} con tus ahorros hormiga.`
        : `¡Disfruta tu ${s.nombre.toLowerCase()}! Meta reiniciada.`,
      { tipo: "exito" },
    );
  });

  // --- Eventos: nueva meta ---
  const botonNueva = $("nueva-btn");
  const formNueva = $<HTMLFormElement>("nueva-form");
  botonNueva.addEventListener("click", () => {
    const abierto = formNueva.classList.toggle("hidden") === false;
    botonNueva.setAttribute("aria-expanded", String(abierto));
    if (abierto) $("nueva-nombre").focus();
  });
  formNueva.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $<HTMLInputElement>("nueva-nombre").value.trim();
    const objetivoBs = Number($<HTMLInputElement>("nueva-monto").value);
    const tipo = $<HTMLSelectElement>("nueva-tipo").value as SubcuentaAhorro["tipo"];
    if (!nombre || !(objetivoBs > 0)) return;

    estado.subcuentas.push({
      id: `meta-${Date.now()}`,
      nombre,
      detalle: "",
      icono: tipo === "servicio" ? "luz" : "objetivo",
      tipo,
      objetivoBs,
      ahorradoUfv: 0,
    });
    escribir(CLAVE_SUBCUENTAS, estado.subcuentas);
    formNueva.reset();
    formNueva.classList.add("hidden");
    botonNueva.setAttribute("aria-expanded", "false");
    render();
    mostrarAviso(`Meta "${nombre}" creada.`, { icono: "objetivo" });
  });

  // --- Reiniciar demo ---
  $("reiniciar-demo").addEventListener("click", () => {
    borrar(CLAVE_SUBCUENTAS, CLAVE_APORTES);
    estado.subcuentas = structuredClone(subcuentasIniciales);
    estado.aportes = [];
    estado.ingreso = INGRESO_DEMO;
    estado.porcentaje = PORCENTAJE_SUGERIDO;
    render();
    mostrarAviso("Demo reiniciada");
  });

  render();
}
