export interface CategoriaPago {
  id: string;
  nombre: string;
  icono: string;
  esPasivo: boolean;
  presupuestoMensual: number;
}

export interface PagoItem {
  id: string;
  comercio: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  hora: string;
  categoriaId: string | null; // null = "Sin tipo"
  detalle: string;
  creadoConModoActivo: boolean;
}

export interface AlertaFinanciera {
  tipo: 'warning' | 'info' | 'success';
  titulo: string;
  mensaje: string;
}

const KEYS = {
  MODO_ACTIVO: 'ufv_pagos_modo_activo',
  TUTORIAL_VISTO: 'ufv_pagos_tutorial_visto',
  SALDO: 'ufv_pagos_saldo',
  CATEGORIAS: 'ufv_pagos_categorias',
  PAGOS: 'ufv_pagos_lista',
};

export const CATEGORIAS_DEFAULT: CategoriaPago[] = [
  { id: 'comida', nombre: 'Comida y merienda', icono: '🍽️', esPasivo: false, presupuestoMensual: 1200 },
  { id: 'servicios', nombre: 'Servicios (Luz/Agua/Gas)', icono: '💡', esPasivo: true, presupuestoMensual: 400 },
  { id: 'suscripciones', nombre: 'Suscripciones y pasivos', icono: '🔄', esPasivo: true, presupuestoMensual: 250 },
  { id: 'estudios', nombre: 'Estudios y libros', icono: '📚', esPasivo: false, presupuestoMensual: 500 },
  { id: 'transporte', nombre: 'Transporte', icono: '🚌', esPasivo: false, presupuestoMensual: 450 },
  { id: 'gustitos', nombre: 'Ropa y gustitos', icono: '🛍️', esPasivo: false, presupuestoMensual: 300 },
];

const PAGOS_INICIALES: PagoItem[] = [
  {
    id: 'p-1',
    comercio: 'Almuerzo Doña Silvia',
    monto: 25,
    fecha: '2026-11-21',
    hora: '13:15',
    categoriaId: null, // Queda "Sin tipo" para demostrar clasificación rápida
    detalle: 'Menú del día',
    creadoConModoActivo: true,
  },
  {
    id: 'p-2',
    comercio: 'Librería Lectura Viva',
    monto: 145,
    fecha: '2026-11-20',
    hora: '16:40',
    categoriaId: 'estudios',
    detalle: 'Libros de ingeniería',
    creadoConModoActivo: true,
  },
  {
    id: 'p-3',
    comercio: 'ENDE Oruro (Luz)',
    monto: 133,
    fecha: '2026-11-18',
    hora: '10:05',
    categoriaId: 'servicios',
    detalle: 'Factura noviembre',
    creadoConModoActivo: true,
  },
  {
    id: 'p-4',
    comercio: 'Cafetería El Prado',
    monto: 65,
    fecha: '2026-11-17',
    hora: '18:20',
    categoriaId: null, // Otro pago rápido sin tipo
    detalle: '',
    creadoConModoActivo: true,
  },
  {
    id: 'p-5',
    comercio: 'Pollería y snacks',
    monto: 240,
    fecha: '2026-11-14',
    hora: '20:10',
    categoriaId: 'gustitos',
    detalle: 'Salida con amigos',
    creadoConModoActivo: true,
  },
];

export function initStore() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.MODO_ACTIVO) === null) {
    localStorage.setItem(KEYS.MODO_ACTIVO, 'true');
  }
  if (localStorage.getItem(KEYS.SALDO) === null) {
    localStorage.setItem(KEYS.SALDO, '3450');
  }
  if (!localStorage.getItem(KEYS.CATEGORIAS)) {
    localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(CATEGORIAS_DEFAULT));
  }
  if (!localStorage.getItem(KEYS.PAGOS)) {
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(PAGOS_INICIALES));
  }
}

export function getModoReportes(): boolean {
  initStore();
  return localStorage.getItem(KEYS.MODO_ACTIVO) === 'true';
}

export function setModoReportes(activo: boolean) {
  localStorage.setItem(KEYS.MODO_ACTIVO, String(activo));
}

export function getTutorialVisto(): boolean {
  return localStorage.getItem(KEYS.TUTORIAL_VISTO) === 'true';
}

export function setTutorialVisto(visto: boolean) {
  localStorage.setItem(KEYS.TUTORIAL_VISTO, String(visto));
}

export function getSaldo(): number {
  initStore();
  return Number(localStorage.getItem(KEYS.SALDO) || 3450);
}

export function getCategorias(): CategoriaPago[] {
  initStore();
  return JSON.parse(localStorage.getItem(KEYS.CATEGORIAS) || '[]');
}

export function agregarCategoria(nombre: string, icono: string, esPasivo: boolean, presupuestoMensual: number): CategoriaPago {
  const categorias = getCategorias();
  const nueva: CategoriaPago = {
    id: 'cat-' + Date.now(),
    nombre: nombre.trim(),
    icono: icono || '📌',
    esPasivo,
    presupuestoMensual: presupuestoMensual > 0 ? presupuestoMensual : 500,
  };
  categorias.push(nueva);
  localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(categorias));
  return nueva;
}

export function getPagos(): PagoItem[] {
  initStore();
  return JSON.parse(localStorage.getItem(KEYS.PAGOS) || '[]');
}

export function registrarPago(datos: {
  comercio: string;
  monto: number;
  categoriaId: string | null;
  detalle: string;
}): PagoItem {
  const pagos = getPagos();
  const modoActivo = getModoReportes();
  const ahora = new Date();
  const fecha = ahora.toISOString().split('T')[0];
  const hora = ahora.toTimeString().slice(0, 5);

  const nuevoPago: PagoItem = {
    id: 'p-' + Date.now(),
    comercio: datos.comercio.trim(),
    monto: Number(datos.monto),
    fecha,
    hora,
    categoriaId: modoActivo ? datos.categoriaId : null,
    detalle: datos.detalle.trim(),
    creadoConModoActivo: modoActivo,
  };

  pagos.unshift(nuevoPago);
  localStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));

  const saldoActual = getSaldo();
  localStorage.setItem(KEYS.SALDO, String(Math.max(0, saldoActual - nuevoPago.monto)));

  return nuevoPago;
}

export function clasificarPago(pagoId: string, categoriaId: string | null) {
  const pagos = getPagos();
  const idx = pagos.findIndex((p) => p.id === pagoId);
  if (idx !== -1) {
    pagos[idx].categoriaId = categoriaId;
    pagos[idx].creadoConModoActivo = true;
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));
  }
}

export function generarAlertas(pagos: PagoItem[], categorias: CategoriaPago[]): AlertaFinanciera[] {
  const alertas: AlertaFinanciera[] = [];
  const totalGastado = pagos.reduce((acc, p) => acc + p.monto, 0);

  const sinTipo = pagos.filter((p) => !p.categoriaId);
  if (sinTipo.length > 0) {
    alertas.push({
      tipo: 'warning',
      titulo: `${sinTipo.length} pago(s) sin clasificar`,
      mensaje: 'Clasifícalos para ver tu reporte exacto.',
    });
  }

  if (totalGastado > 0) {
    const gastoGustitos = pagos
      .filter((p) => p.categoriaId === 'gustitos')
      .reduce((acc, p) => acc + p.monto, 0);
    const porcentajeGustitos = Math.round((gastoGustitos / totalGastado) * 100);

    if (porcentajeGustitos >= 25) {
      alertas.push({
        tipo: 'warning',
        titulo: `Gustitos: ${porcentajeGustitos}% de tus gastos`,
        mensaje: `Bs ${gastoGustitos.toFixed(0)} este mes. Bajarlo te deja más para ahorrar.`,
      });
    }

    const idsPasivos = categorias.filter((c) => c.esPasivo).map((c) => c.id);
    const gastoPasivo = pagos
      .filter((p) => p.categoriaId && idsPasivos.includes(p.categoriaId))
      .reduce((acc, p) => acc + p.monto, 0);

    if (gastoPasivo > 0) {
      alertas.push({
        tipo: 'info',
        titulo: `Servicios y pasivos: Bs ${gastoPasivo.toFixed(0)}`,
        mensaje: 'Cubre luz o agua con tu Caja Hormiga.',
      });
    }
  }

  if (alertas.length === 0) {
    alertas.push({
      tipo: 'success',
      titulo: 'Todo en orden',
      mensaje: 'Tus pagos están clasificados.',
    });
  }

  return alertas;
}