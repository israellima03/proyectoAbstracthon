/** Ayudas del navegador para el perfil: avisos, hojas inferiores y guardado local. */

/** Muestra un aviso corto arriba de la pantalla. */
export function avisar(texto: string) {
  const contenedor = document.getElementById("perfil-aviso");
  if (!contenedor) return;
  const el = document.createElement("div");
  el.className =
    "rounded-xl border-2 border-tinta bg-superficie px-4 py-2.5 text-center text-sm font-bold shadow-duro transition duration-300 opacity-0 -translate-y-2";
  el.textContent = texto;
  contenedor.appendChild(el);
  setTimeout(() => el.classList.remove("opacity-0", "-translate-y-2"), 20);
  setTimeout(() => {
    el.classList.add("opacity-0", "-translate-y-2");
    setTimeout(() => el.remove(), 300);
  }, 2800);
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
