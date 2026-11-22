/**
 * Lógica de la pantalla de Ahorro (se ejecuta en el navegador).
 * Por ahora guarda los datos en localStorage; luego se cambia por el backend.
 */
import {
  INGRESO_DEMO,
  PORCENTAJE_MAX,
  PORCENTAJE_MIN,
  PORCENTAJE_SUGERIDO,
  subcuentasIniciales,
} from "../../data/ahorro";
import { mostrarAviso } from "../../lib/aviso";
import {
  MAX_RETIROS_MES,
  RECORDATORIO_RETIROS,
  registrarRetiro,
  reiniciarRetiros,
  retirosRestantes,
  textoRetirosRestantes,
} from "../../lib/retiros";
import { bsAUfv, formatoBs, formatoUfv, ufvABs } from "../../lib/ufv";
import type { SubcuentaAhorro } from "../../types";
import { svgIcono } from "../ui/iconos";

const CLAVE_STORAGE = "ahorro:subcuentas:v1";

// ---------- Estado ----------
interface Estado {
  subcuentas: SubcuentaAhorro[];
  /** Ingreso pendiente de decidir (null = no hay sugerencia) */
  ingreso: number | null;
  porcentaje: number;
  /** Subcuenta con el formulario de retiro abierto */
  retirandoId: string | null;
}

function cargarSubcuentas(): SubcuentaAhorro[] {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado) return JSON.parse(guardado) as SubcuentaAhorro[];
  } catch {
    /* sin storage: usamos los datos de ejemplo */
  }
  return structuredClone(subcuentasIniciales);
}

function guardarSubcuentas(subcuentas: SubcuentaAhorro[]) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(subcuentas));
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

const botonSecundario =
  "rounded-xl border-2 border-tinta bg-superficie font-bold shadow-duro-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

function formularioRetiro(s: SubcuentaAhorro): string {
  const restantes = retirosRestantes();
  const maximo = Math.floor(ahorradoBs(s) * 100) / 100;
  if (restantes === 0) {
    return `<div class="mt-3 rounded-xl border-2 border-tinta bg-peligro-suave p-3 text-xs font-semibold">
      ⚠️ ${textoRetirosRestantes(0)}
      <button type="button" data-cancelar class="mt-2 block underline">Cerrar</button>
    </div>`;
  }
  return `<form data-form-retiro="${s.id}" class="mt-3 space-y-2 rounded-xl border-2 border-tinta bg-fondo p-3">
    <label for="retiro-${s.id}" class="block text-xs font-bold">¿Cuánto quieres retirar? (máx. ${formatoBs(maximo)})</label>
    <div class="flex gap-2">
      <input id="retiro-${s.id}" name="monto" type="number" inputmode="decimal" min="1" max="${maximo}" step="any" required placeholder="Bs"
        class="min-w-0 flex-1 rounded-xl border-2 border-tinta bg-superficie px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primario-claro" />
      <button type="submit" class="btn-accion px-4 text-sm">Retirar</button>
      <button type="button" data-cancelar aria-label="Cancelar retiro" class="${botonSecundario} grid w-10 place-items-center">${svgIcono("cerrar", "size-4")}</button>
    </div>
    <p class="text-[11px] font-semibold">⚠️ ${textoRetirosRestantes(restantes)}</p>
  </form>`;
}

function tarjetaSubcuenta(s: SubcuentaAhorro, retirando: boolean): string {
  const pct = progreso(s);
  const lista = estaLista(s);
  const fondoIcono = s.tipo === "servicio" ? "bg-primario-suave text-primario" : "bg-alerta-suave text-tinta";
  const textoAccion = s.tipo === "servicio" ? `Pagar ${escapar(s.nombre.toLowerCase())} ahora` : "Usar mi ahorro";
  const puedeRetirar = s.ahorradoUfv > 0.001;

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
      <span class="chip shrink-0 ${colorChip(pct)}">${lista ? "✓ Lista" : `${Math.floor(pct)}%`}</span>
    </div>

    <div class="mt-3 h-3 overflow-hidden rounded-full border-2 border-tinta bg-fondo">
      <div class="h-full transition-all duration-500 ${lista ? "bg-exito" : "bg-primario"}" style="width:${pct}%"></div>
    </div>

    <div class="mt-2 flex items-center justify-between gap-2 text-xs">
      ${
        lista
          ? `<span class="font-semibold text-exito">¡Meta cumplida! 🎉</span>`
          : `<span class="font-semibold text-primario">Te faltan ${formatoBs(Math.ceil(faltaBs(s)))} 🎯</span>`
      }
      ${
        puedeRetirar && !retirando
          ? `<button type="button" data-retirar="${s.id}" class="chip bg-superficie py-1 shadow-duro-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">${svgIcono("menos", "size-3", 3)} Retirar</button>`
          : ""
      }
    </div>

    ${retirando ? formularioRetiro(s) : ""}

    ${
      lista && !retirando
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
    subcuentas: cargarSubcuentas(),
    ingreso: INGRESO_DEMO, // la demo arranca con un ingreso recibido
    porcentaje: PORCENTAJE_SUGERIDO,
    retirandoId: null,
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

    const restantes = retirosRestantes();
    const chip = $("resumen-retiros");
    chip.textContent = `${restantes}/${MAX_RETIROS_MES} retiros disponibles este mes`;
    chip.classList.toggle("bg-peligro-suave", restantes === 0);
    chip.classList.toggle("bg-fondo", restantes > 0);
  }

  function renderSubcuentas() {
    $("lista-subcuentas").innerHTML = estado.subcuentas
      .map((s) => tarjetaSubcuenta(s, s.id === estado.retirandoId))
      .join("");

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
    guardarSubcuentas(estado.subcuentas);

    estado.ingreso = null;
    estado.porcentaje = PORCENTAJE_SUGERIDO;
    render();
    mostrarAviso(RECORDATORIO_RETIROS, {
      tipo: "exito",
      titulo: estaLista(destino)
        ? `¡${destino.nombre} llegó al 100%! 🎉`
        : `¡Ahorraste ${formatoUfv(montoUfv)} UFV en ${destino.nombre}! 💪`,
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

  // --- Eventos de las tarjetas: pagar, abrir/cerrar retiro ---
  const lista = $("lista-subcuentas");
  lista.addEventListener("click", (e) => {
    const objetivo = e.target as HTMLElement;

    const botonRetirar = objetivo.closest<HTMLButtonElement>("[data-retirar]");
    if (botonRetirar) {
      estado.retirandoId = botonRetirar.dataset.retirar ?? null;
      renderSubcuentas();
      document.getElementById(`retiro-${estado.retirandoId}`)?.focus();
      return;
    }

    if (objetivo.closest("[data-cancelar]")) {
      estado.retirandoId = null;
      renderSubcuentas();
      return;
    }

    const botonPagar = objetivo.closest<HTMLButtonElement>("[data-pagar]");
    if (!botonPagar) return;
    const s = estado.subcuentas.find((x) => x.id === botonPagar.dataset.pagar);
    if (!s) return;
    // Se descuenta lo que cuesta; si sobró algo queda para el próximo mes
    s.ahorradoUfv = Math.max(0, s.ahorradoUfv - bsAUfv(s.objetivoBs));
    guardarSubcuentas(estado.subcuentas);
    render();
    mostrarAviso(
      s.tipo === "servicio"
        ? `Pagaste ${s.nombre.toLowerCase()} con tus ahorros hormiga ✅`
        : `¡Disfruta tu ${s.nombre.toLowerCase()}! Meta reiniciada ✅`,
      { tipo: "exito" },
    );
  });

  // --- Retiro de una subcuenta (cuenta para el límite de 4 al mes) ---
  lista.addEventListener("submit", (e) => {
    const form = (e.target as HTMLElement).closest<HTMLFormElement>("[data-form-retiro]");
    if (!form) return;
    e.preventDefault();
    const s = estado.subcuentas.find((x) => x.id === form.dataset.formRetiro);
    const montoBs = redondear(Number(new FormData(form).get("monto")));
    if (!s || !(montoBs > 0)) return;

    if (retirosRestantes() === 0) {
      mostrarAviso(textoRetirosRestantes(0), { tipo: "alerta", titulo: "Sin retiros disponibles" });
      return;
    }
    if (montoBs > ahorradoBs(s) + 0.001) {
      mostrarAviso(`En ${s.nombre} solo tienes ${formatoBs(Math.floor(ahorradoBs(s) * 100) / 100)}.`, {
        tipo: "alerta",
      });
      return;
    }

    s.ahorradoUfv = Math.max(0, s.ahorradoUfv - bsAUfv(montoBs));
    guardarSubcuentas(estado.subcuentas);
    const restantes = registrarRetiro();
    estado.retirandoId = null;
    render();
    mostrarAviso(textoRetirosRestantes(restantes), {
      tipo: "alerta",
      titulo: `Retiraste ${formatoBs(montoBs)} de ${s.nombre}`,
    });
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
    guardarSubcuentas(estado.subcuentas);
    formNueva.reset();
    formNueva.classList.add("hidden");
    botonNueva.setAttribute("aria-expanded", "false");
    render();
    mostrarAviso(`Meta "${nombre}" creada 🎯`);
  });

  // --- Reiniciar demo ---
  $("reiniciar-demo").addEventListener("click", () => {
    try {
      localStorage.removeItem(CLAVE_STORAGE);
    } catch {
      /* ignorar */
    }
    reiniciarRetiros();
    estado.subcuentas = structuredClone(subcuentasIniciales);
    estado.ingreso = INGRESO_DEMO;
    estado.porcentaje = PORCENTAJE_SUGERIDO;
    estado.retirandoId = null;
    render();
    mostrarAviso("Demo reiniciada");
  });

  render();
}
