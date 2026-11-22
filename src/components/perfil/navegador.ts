/** Ayudas del navegador para el perfil: avisos, hojas flotantes y guardado local. */
import { mostrarAviso, type TipoAviso } from "../../lib/aviso";

/** Aviso arriba de la pantalla (usa el aviso compartido de AppLayout). */
export function avisar(mensaje: string, tipo: TipoAviso = "exito", titulo?: string) {
  mostrarAviso(mensaje, { tipo, titulo });
}

export function abrirHoja(id: string) {
  const hoja = document.getElementById(id);
  if (!hoja) return;
  hoja.hidden = false;
  hoja.querySelector<HTMLElement>("[data-cerrar-boton]")?.focus();
}

export function cerrarHoja(id: string) {
  const hoja = document.getElementById(id);
  if (hoja) hoja.hidden = true;
}

/** Lee de localStorage sin romper si está bloqueado. */
export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? (JSON.parse(valor) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: se pierde al recargar */
  }
}
