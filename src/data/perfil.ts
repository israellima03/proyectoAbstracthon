import type { CategoriaPremio, DiaRacha, Premio, Reto } from "../types";

/*
 * Datos de ejemplo de la sección Perfil (incluye la racha).
 * TODO: reemplazar por los datos reales de la API.
 */

export const usuario = {
  nombre: "Mateo Fernández",
  nombreCorto: "Mateo",
  correo: "mateo@correo.bo",
  iniciales: "MF",
  nivel: 3,
  titulo: "Ahorrista UFV",
};


/**
 * Racha de ahorro (idea 6): cada día se deposita el monto diario del plan
 * o se compra 1 UFV. Si se falla un día, hay 24 h para recuperarla
 * poniendo lo de ayer + lo de hoy. Los puntos son por constancia, no por monto.
 */
export const racha = {
  dias: 12,
  /** El viernes no ahorró → la racha está en riesgo y se puede recuperar hoy. */
  ayerCumplido: false,
  hoyCumplido: false,
  /** Bs por día. Se recalcula cuando el usuario guarda su plan del mes. */
  montoDiario: 20,
  puntos: 1250,
  puntosPorDia: 10,
  semana: [
    { letra: "L", estado: "hecho" },
    { letra: "M", estado: "hecho" },
    { letra: "M", estado: "hecho" },
    { letra: "J", estado: "hecho" },
    { letra: "V", estado: "fallo" },
    { letra: "S", estado: "hoy" },
    { letra: "D", estado: "pendiente" },
  ] as DiaRacha[],
};

export const retos: Reto[] = [
  {
    id: "ahorro-hoy",
    titulo: "Ahorra tu monto del día",
    detalle: "o compra 1 UFV",
    puntos: 50,
    icono: "llama",
    accion: { tipo: "enlace", href: "/ufvs#operaciones" },
  },
  {
    // Se completa solo cuando en Pagos no quedan pagos del mes "Sin tipo"
    id: "clasificar-pagos",
    titulo: "Clasifica tus pagos sin tipo",
    detalle: "en Pagos",
    puntos: 20,
    icono: "pagos",
    accion: { tipo: "enlace", href: "/pagos" },
  },
  {
    id: "plan-mes",
    titulo: "Arma tu plan del mes",
    detalle: "en Inicio",
    puntos: 30,
    icono: "sueldo",
    accion: { tipo: "enlace", href: "/" },
  },
  {
    id: "transferir-ufv",
    titulo: "Transfiere a tu cuenta UFV",
    puntos: 100,
    icono: "rayo",
    accion: { tipo: "enlace", href: "/ufvs#operaciones" },
  },
];

export const categoriasPremio: { id: CategoriaPremio | "todas"; etiqueta: string }[] = [
  { id: "todas", etiqueta: "Todas" },
  { id: "megas", etiqueta: "Megas" },
  { id: "descuentos", etiqueta: "Descuentos" },
  { id: "ufv", etiqueta: "UFV extra" },
];

/** Recompensas que se canjean con los puntos de la racha (idea 6). */
export const premios: Premio[] = [
  {
    id: "megas-1",
    titulo: "1 GB de megas",
    detalle: "Válido 7 días",
    costo: 500,
    icono: "celular",
    categoria: "megas",
    mensaje: "Te llegará 1 GB de megas por SMS",
  },
  {
    id: "megas-3",
    titulo: "3 GB de megas",
    detalle: "Válido 30 días",
    costo: 1200,
    icono: "celular",
    categoria: "megas",
    mensaje: "Te llegarán 3 GB de megas por SMS",
  },
  {
    id: "cafe",
    titulo: "20% en Café Aliado",
    detalle: "Negocio aliado",
    costo: 800,
    icono: "etiqueta",
    categoria: "descuentos",
    mensaje: "Cupón del 20% guardado en tu perfil",
  },
  {
    id: "cine",
    titulo: "2x1 en el cine",
    detalle: "Lunes a jueves",
    costo: 1500,
    icono: "etiqueta",
    categoria: "descuentos",
    mensaje: "Cupón 2x1 de cine guardado",
  },
  {
    id: "libreria",
    titulo: "15% en librería",
    detalle: "Útiles y libros",
    costo: 600,
    icono: "etiqueta",
    categoria: "descuentos",
    mensaje: "Cupón del 15% en librería guardado",
  },
  {
    id: "ufv-5",
    titulo: "+5 UFV a tu meta",
    detalle: "Plata extra en UFV",
    costo: 1200,
    icono: "moneda",
    categoria: "ufv",
    mensaje: "Sumamos 5 UFV a tu meta",
  },
  {
    id: "ufv-15",
    titulo: "+15 UFV a tu meta",
    detalle: "Plata extra en UFV",
    costo: 3000,
    icono: "moneda",
    categoria: "ufv",
    mensaje: "Sumamos 15 UFV a tu meta",
  },
];

