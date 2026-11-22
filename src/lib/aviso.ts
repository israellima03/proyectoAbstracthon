/**
 * Avisos tipo notificación que aparecen arriba de la pantalla del celular.
 * El elemento #aviso está en AppLayout, así que funciona en cualquier página.
 *
 *   mostrarAviso("¡Listo!", { tipo: "exito", titulo: "Ahorro guardado" });
 */
import { svgIcono, type NombreIcono } from "../components/ui/iconos";

export type TipoAviso = "info" | "exito" | "alerta";

const estilos: Record<TipoAviso, string> = {
  info: "bg-tinta text-white",
  exito: "bg-exito text-white",
  alerta: "bg-alerta-suave text-tinta",
};

const iconoPorTipo: Record<TipoAviso, NombreIcono> = {
  info: "campana",
  exito: "listo",
  alerta: "alerta",
};

let timer: number | undefined;

function escapar(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

export function mostrarAviso(
  mensaje: string,
  {
    tipo = "info",
    titulo,
    duracion = 4500,
    icono = iconoPorTipo[tipo],
  }: { tipo?: TipoAviso; titulo?: string; duracion?: number; icono?: NombreIcono } = {},
) {
  const aviso = document.getElementById("aviso");
  if (!aviso) return;

  aviso.className = aviso.dataset.base + " " + estilos[tipo];
  aviso.innerHTML = `<div class="flex items-start gap-2.5">
    ${svgIcono(icono, "mt-0.5 size-5 shrink-0", 2.25)}
    <div class="min-w-0 space-y-0.5">
      ${titulo ? `<p class="font-extrabold">${escapar(titulo)}</p>` : ""}<p>${escapar(mensaje)}</p>
    </div>
  </div>`;
  aviso.hidden = false;

  clearTimeout(timer);
  timer = window.setTimeout(() => (aviso.hidden = true), duracion);
  aviso.onclick = () => (aviso.hidden = true);
}
