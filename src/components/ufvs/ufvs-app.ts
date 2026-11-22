/**
 * Lógica de la pantalla UFVs: comprar UFV por QR, retirar a Bs (máx. 4 veces al mes) y movimientos.
 */
import { mostrarAviso } from "../../lib/aviso";
import { registrarCompraUfv } from "../../lib/racha";
import { cargarCuenta, guardarCuenta, reiniciarCuenta } from "../../lib/cuenta-ufv";
import {
  MAX_RETIROS_MES,
  RECORDATORIO_RETIROS,
  registrarRetiro,
  reiniciarRetiros,
  retirosRestantes,
  retirosUsados,
  textoRetirosRestantes,
} from "../../lib/retiros";
import { MINIMO_DEPOSITO_UFV, formatoBs, formatoUfv, ufvABs } from "../../lib/ufv";
import { calcularAhorroMensual, svgGraficoAhorro } from "./grafico-ahorro";

type Modo = "comprar" | "retirar";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const redondear = (n: number) => Math.round(n * 100) / 100;

/** QR de demostración (no es un QR real): patrón aleatorio con los 3 cuadros de las esquinas. */
function qrFalso(semilla: number): string {
  const n = 25;
  let s = Math.floor(semilla * 1000) || 1;
  const azar = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const esFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  const finder = (ox: number, oy: number) =>
    `<rect x="${ox}" y="${oy}" width="7" height="7"/><rect x="${ox + 1}" y="${oy + 1}" width="5" height="5" fill="#fff"/><rect x="${ox + 2}" y="${oy + 2}" width="3" height="3"/>`;

  let celdas = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (!esFinder(x, y) && azar() > 0.5) celdas += `<rect x="${x}" y="${y}" width="1" height="1"/>`;

  return `<svg viewBox="0 0 ${n} ${n}" class="w-full" shape-rendering="crispEdges" fill="#1d1b2c" role="img" aria-label="Código QR de pago">${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${celdas}</svg>`;
}

const fmtFecha = new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function iniciarUfvs() {
  let cuenta = cargarCuenta();
  let modo: Modo = "comprar";
  let compraPendiente: number | null = null;

  const inputComprar = $<HTMLInputElement>("comprar-ufv");
  const inputRetirar = $<HTMLInputElement>("retirar-ufv");
  const botonRetirar = $<HTMLButtonElement>("retirar-btn");

  // ---------- Render ----------
  function renderSaldo() {
    $("saldo-ufv").textContent = formatoUfv(cuenta.saldoUfv);
    $("saldo-bs").textContent = formatoBs(redondear(ufvABs(cuenta.saldoUfv)));

    const usados = retirosUsados();
    $("retiros-texto").textContent = `${usados}/${MAX_RETIROS_MES}`;
    $("retiros-puntos")
      .querySelectorAll("span")
      .forEach((p, i) => {
        p.classList.toggle("bg-peligro", i < usados);
        p.classList.toggle("bg-superficie", i >= usados);
      });
  }

  function renderModo() {
    document.querySelectorAll<HTMLButtonElement>("[data-modo]").forEach((b) => {
      const activo = b.dataset.modo === modo;
      b.setAttribute("aria-selected", String(activo));
      b.classList.toggle("bg-primario", activo);
      b.classList.toggle("text-white", activo);
      b.classList.toggle("text-tinta-suave", !activo);
    });
    $("panel-comprar").classList.toggle("hidden", modo !== "comprar");
    $("panel-retirar").classList.toggle("hidden", modo !== "retirar");
  }

  function renderComprar() {
    const ufv = Number(inputComprar.value) || 0;
    $("comprar-bs").textContent = formatoBs(redondear(ufvABs(ufv)));
    $("comprar-btn-ufv").textContent = formatoUfv(ufv);
    const pendiente = compraPendiente !== null;
    $("comprar-form-wrap").classList.toggle("hidden", pendiente);
    $("qr-area").classList.toggle("hidden", !pendiente);
  }

  function renderRetirar() {
    const ufv = Number(inputRetirar.value) || 0;
    const restantes = retirosRestantes();
    $("retirar-bs").textContent = formatoBs(redondear(ufvABs(ufv)));
    $("retirar-aviso").textContent = `⚠️ ${textoRetirosRestantes(restantes)}`;
    $("retirar-aviso").classList.toggle("bg-peligro-suave", restantes === 0);
    $("retirar-aviso").classList.toggle("bg-alerta-suave", restantes > 0);
    botonRetirar.disabled = restantes === 0;
    botonRetirar.textContent = ufv > 0 ? `Retirar ${formatoBs(redondear(ufvABs(ufv)))}` : "Retirar";
  }

  function renderMovimientos() {
    const lista = $("lista-movimientos");
    if (!cuenta.movimientos.length) {
      lista.innerHTML = `<li class="p-4 text-center text-sm text-tinta-suave">Aún no tienes movimientos.</li>`;
      return;
    }
    lista.innerHTML = [...cuenta.movimientos]
      .reverse()
      .slice(0, 8)
      .map((m) => {
        const compra = m.tipo === "compra";
        return `<li class="flex items-center gap-3 p-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-tinta font-extrabold ${compra ? "bg-exito-suave text-exito" : "bg-peligro-suave text-peligro"}">${compra ? "↓" : "↑"}</span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold">${compra ? "Compra de UFV (QR)" : "Retiro a Caja de Ahorros"}</p>
            <p class="text-[11px] text-tinta-suave">${fmtFecha.format(new Date(m.fecha))}</p>
          </div>
          <p class="text-sm font-extrabold ${compra ? "text-exito" : "text-peligro"}">${compra ? "+" : "−"}${formatoUfv(m.ufv)} UFV</p>
        </li>`;
      })
      .join("");
  }

  function renderGraficoAhorro() {
    const datos = calcularAhorroMensual(cuenta.movimientos);
    const mejor = datos.reduce((a, b) => (b.ahorradoBs > a.ahorradoBs ? b : a));
    $("ga-svg").innerHTML = svgGraficoAhorro(datos);
    $("ga-mejor-mes").textContent = mejor.ahorradoBs > 0 ? mejor.nombre : "—";
    $("ga-mejor-monto").textContent = formatoBs(redondear(mejor.ahorradoBs));
    $("ga-ganancia").textContent = `+Bs ${formatoUfv(datos.at(-1)!.gananciaBs)}`;
  }

  function render() {
    renderSaldo();
    renderGraficoAhorro();
    renderModo();
    renderComprar();
    renderRetirar();
    renderMovimientos();
  }

  function error(id: string, mensaje: string | null) {
    const el = $(id);
    el.textContent = mensaje ?? "";
    el.classList.toggle("hidden", !mensaje);
  }

  function irA(nuevo: Modo) {
    modo = nuevo;
    renderModo();
    $("operaciones").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- Eventos ----------
  $("ir-comprar").addEventListener("click", () => irA("comprar"));
  $("ir-retirar").addEventListener("click", () => irA("retirar"));
  document.querySelectorAll<HTMLButtonElement>("[data-modo]").forEach((b) =>
    b.addEventListener("click", () => {
      modo = b.dataset.modo as Modo;
      renderModo();
    }),
  );

  // Comprar
  inputComprar.addEventListener("input", () => {
    error("comprar-error", null);
    renderComprar();
  });
  $("comprar-btn").addEventListener("click", () => {
    const ufv = Number(inputComprar.value);
    if (!(ufv >= MINIMO_DEPOSITO_UFV)) {
      error("comprar-error", `El depósito mínimo es de ${MINIMO_DEPOSITO_UFV} UFV.`);
      return;
    }
    compraPendiente = redondear(ufv);
    $("qr-svg").innerHTML = qrFalso(compraPendiente + Date.now() / 1e6);
    $("qr-bs").textContent = formatoBs(redondear(ufvABs(compraPendiente)));
    $("qr-ufv").textContent = formatoUfv(compraPendiente);
    renderComprar();
  });
  $("qr-cancelar").addEventListener("click", () => {
    compraPendiente = null;
    renderComprar();
  });
  $("qr-confirmar").addEventListener("click", () => {
    if (compraPendiente === null) return;
    const ufv = compraPendiente;
    cuenta.saldoUfv = redondear(cuenta.saldoUfv + ufv);
    cuenta.movimientos.push({ tipo: "compra", ufv, fecha: new Date().toISOString() });
    guardarCuenta(cuenta);
    compraPendiente = null;
    render();

    // La compra cuenta como el ahorro del día de la racha (ver src/lib/racha.ts)
    const racha = registrarCompraUfv(ufv);
    const textoRacha = racha
      ? `${racha.recupera ? "Recuperaste tu racha" : "Racha al día"}: ${racha.dias} días · +${racha.puntos} pts. `
      : "";
    mostrarAviso(textoRacha + RECORDATORIO_RETIROS, { tipo: "exito", titulo: `¡Compraste ${formatoUfv(ufv)} UFV! 🛡️` });
  });

  // Retirar
  inputRetirar.addEventListener("input", () => {
    error("retirar-error", null);
    renderRetirar();
  });
  $("retirar-todo").addEventListener("click", () => {
    inputRetirar.value = String(cuenta.saldoUfv);
    error("retirar-error", null);
    renderRetirar();
  });
  botonRetirar.addEventListener("click", () => {
    const ufv = redondear(Number(inputRetirar.value));
    if (retirosRestantes() === 0) {
      mostrarAviso(textoRetirosRestantes(0), { tipo: "alerta", titulo: "Sin retiros disponibles" });
      return;
    }
    if (!(ufv > 0)) return error("retirar-error", "Ingresa cuántas UFV quieres retirar.");
    if (ufv > cuenta.saldoUfv) return error("retirar-error", `Solo tienes ${formatoUfv(cuenta.saldoUfv)} UFV.`);

    cuenta.saldoUfv = redondear(cuenta.saldoUfv - ufv);
    cuenta.movimientos.push({ tipo: "retiro", ufv, fecha: new Date().toISOString() });
    guardarCuenta(cuenta);
    const restantes = registrarRetiro();
    inputRetirar.value = "";
    render();
    mostrarAviso(textoRetirosRestantes(restantes), {
      tipo: "alerta",
      titulo: `Retiraste ${formatoBs(redondear(ufvABs(ufv)))} a tu Caja de Ahorros`,
    });
  });

  // Reiniciar demo
  $("reiniciar-demo").addEventListener("click", () => {
    cuenta = reiniciarCuenta();
    reiniciarRetiros();
    compraPendiente = null;
    inputRetirar.value = "";
    render();
    mostrarAviso("Demo reiniciada");
  });

  render();
}
