/**
 * Avisos tipo notificación que aparecen arriba de la pantalla del celular.
 * El elemento #aviso está en AppLayout, así que funciona en cualquier página.
 *
 *   mostrarAviso("¡Listo!", { tipo: "exito", titulo: "Ahorro guardado" });
 */
export type TipoAviso = "info" | "exito" | "alerta";

const estilos: Record<TipoAviso, string> = {
  info: "bg-tinta text-white",
  exito: "bg-exito text-white",
  alerta: "bg-alerta-suave text-tinta",
};

let timer: number | undefined;

function escapar(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

export function mostrarAviso(
  mensaje: string,
  { tipo = "info", titulo, duracion = 4500 }: { tipo?: TipoAviso; titulo?: string; duracion?: number } = {},
) {
  const aviso = document.getElementById("aviso");
  if (!aviso) return;

  aviso.className = aviso.dataset.base + " " + estilos[tipo];
  aviso.innerHTML = `${titulo ? `<p class="font-extrabold">${escapar(titulo)}</p>` : ""}<p>${escapar(mensaje)}</p>`;
  aviso.hidden = false;

  clearTimeout(timer);
  timer = window.setTimeout(() => (aviso.hidden = true), duracion);
  aviso.onclick = () => (aviso.hidden = true);
}
