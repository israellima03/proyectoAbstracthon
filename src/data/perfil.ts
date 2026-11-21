import type { AjustesSeguridad, DiaRacha, GastosFijos, Premio, Reto } from "../types";

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

export const resumen = {
  ufvAhorradas: 1380,
  /** Bs por 1 UFV (valor de ejemplo; el real lo publica el BCB cada día). */
  valorUfv: 2.56,
  metasCumplidas: 4,
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
    accion: { tipo: "ahorrar" },
  },
  {
    id: "motivo-pagos",
    titulo: "Registra el motivo de 3 pagos",
    puntos: 20,
    icono: "pagos",
    listo: true,
    accion: { tipo: "enlace", href: "/pagos" },
  },
  {
    id: "plan-mes",
    titulo: "Arma tu plan del mes",
    detalle: "sueldo y gastos fijos",
    puntos: 30,
    icono: "sueldo",
    accion: { tipo: "hoja", hoja: "hoja-sueldo" },
  },
  {
    id: "transferir-ufv",
    titulo: "Transfiere a tu cuenta UFV",
    puntos: 100,
    icono: "rayo",
    accion: { tipo: "enlace", href: "/ufvs" },
  },
];

export const premios: Premio[] = [
  {
    id: "megas",
    titulo: "1 GB de megas",
    detalle: "Para tu celular",
    costo: 500,
    icono: "celular",
    mensaje: "¡Listo! Te llegará 1 GB de megas por SMS 📱",
  },
  {
    id: "aliado",
    titulo: "20% en Café Aliado",
    detalle: "Negocio aliado",
    costo: 800,
    icono: "etiqueta",
    mensaje: "¡Cupón del 20% guardado en tu perfil! ☕",
  },
  {
    id: "ufv-extra",
    titulo: "+5 UFV a tu meta",
    detalle: "Plata extra en UFV",
    costo: 1200,
    icono: "moneda",
    mensaje: "¡Sumamos 5 UFV a tu meta! 💰",
  },
];

/** Valores de ejemplo para el formulario de gastos fijos (idea 1). */
export const gastosEjemplo: GastosFijos = {
  sueldo: 5400,
  diaCobro: 5,
  pagaAlquiler: true,
  alquiler: 1500,
  luz: 120,
  agua: 60,
  gas: 25,
  internet: 150,
  suscripciones: 60,
  transporte: 200,
  dependientes: 1,
  gastoDependientes: 600,
  otros: 0,
};

export const seguridadInicial: AjustesSeguridad = {
  pin: true,
  biometria: false,
  pinEnPagos: true,
  alertasSesion: true,
};
