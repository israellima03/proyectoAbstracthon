/**
 * Lógica de respuestas del chatbot (la mascota).
 * Por ahora usa respuestas locales de ejemplo.
 * TODO: reemplazar `obtenerRespuesta` por una llamada a la API real (IA).
 */

export const preguntasRapidas = [
  "¿Qué es la UFV?",
  "¿Cómo gasto menos en hormiga?",
  "Dame un consejo",
] as const;

/* ---------------------------------------------------------
   Menu del chat (vista simulada, sin API): dos niveles.
   Cada tema es un chip principal y `sub` son sus subpreguntas.
   --------------------------------------------------------- */

export interface Tema {
  pregunta: string;
  respuesta: string;
  sub: { pregunta: string; respuesta: string }[];
}

export const menuChatbot: Tema[] = [
  {
    pregunta: "¿Qué es la UFV?",
    respuesta:
      "La UFV (Unidad de Fomento a la Vivienda) es una unidad que sube con la inflación. Su valor lo publica el Banco Central de Bolivia, así que ahorrar en UFV ayuda a que tu plata no pierda poder de compra.",
    sub: [
      {
        pregunta: "¿Cómo obtengo UFV?",
        respuesta:
          "Desde la pestaña UFVs, depositas desde tu Caja de Ahorros con un QR, sin ir al banco. El mínimo es de 30 UFV, unos Bs 76 al valor de hoy.",
      },
      {
        pregunta: "¿Qué ventajas tengo si ahorro en UFV?",
        respuesta:
          "Tu ahorro conserva su valor frente a la inflación, ves cuánto creció en el tiempo y puedes empezar con poco. Ojo: la UFV protege el valor, no es una ganancia garantizada.",
      },
      {
        pregunta: "¿Cuánto vale hoy una UFV?",
        respuesta:
          "Hoy 1 UFV = Bs 2,5418. Si ahorraste 100 UFV en 2020 (Bs 233,10), hoy equivalen a Bs 254,18.",
      },
      {
        pregunta: "¿La UFV puede bajar?",
        respuesta:
          "Sigue a la inflación: sube cuando los precios suben. Si los precios bajaran mucho, su valor podría bajar, pero históricamente ha ido subiendo.",
      },
    ],
  },
  {
    pregunta: "¿En qué gasto mucho?",
    respuesta:
      "Con tus pagos registrados armo un reporte por categoría: comida, entretenimiento, estudios, tecnología y otros. Así ves dónde se va tu plata cada mes.",
    sub: [
      {
        pregunta: "¿Cómo puedo ahorrar?",
        respuesta:
          "Empieza con el 5% de cada ingreso, que va solo a tu subcuenta de ahorro. Si te sobra, súbelo poco a poco.",
      },
      {
        pregunta: "Ver mis gastos del mes",
        respuesta:
          "Este mes lo que más gastas es comida (38%), luego entretenimiento (24%) y transporte (17%). Si recortas 2 salidas al mes, ahorras unos Bs 120.",
      },
      {
        pregunta: "¿Qué es el gasto hormiga?",
        respuesta:
          "Son gastos pequeños y repetidos (snacks, delivery, recargas) que parecen poco pero suman. Te aviso cuando uno pasa del límite semanal.",
      },
      {
        pregunta: "Activar el 5% automático",
        respuesta:
          "Listo. Cada vez que te llegue un ingreso te propongo apartar el 5%, y tú puedes subirlo o bajarlo.",
      },
    ],
  },
  {
    pregunta: "Quiero alcanzar una meta",
    respuesta:
      "Cuéntame qué quieres lograr y para cuándo. Con tus ingresos y gastos fijos te armo un plan de ahorro con metas por semana.",
    sub: [
      {
        pregunta: "Ahorrar para una computadora",
        respuesta:
          "Tomo como referencia una laptop de Bs 4.500. En 6 meses necesitas ahorrar Bs 750 al mes, unos Bs 173 por semana.",
      },
      {
        pregunta: "¿En cuánto tiempo lo lograría?",
        respuesta:
          "Depende de cuánto aportes: con Bs 750 al mes, en 6 meses; con Bs 400 al mes, en unos 12 meses.",
      },
      {
        pregunta: "¿En qué plan lo ahorro?",
        respuesta:
          "Tienes tres opciones: ahorro en Bs (flexible), ahorro en UFV (protege del alza de precios) o ahorro automático con el 5% por ingreso.",
      },
      {
        pregunta: "¿Cuánto debo ahorrar por semana?",
        respuesta:
          "Para la laptop en 6 meses, Bs 173 por semana. Si lo haces en 4 meses, sube a Bs 260 por semana.",
      },
      {
        pregunta: "Cambiar la fecha de mi meta",
        respuesta: "Dime la nueva fecha y recalculo el ahorro mensual y semanal de tu plan.",
      },
    ],
  },
];

/** Respuesta a cualquier texto que escriba el usuario. */
export const respuestaGenerica = "Anotado. Estoy armando tu plan de ahorro con esa meta.";

/** Pausa antes de que responda el bot, para simular que escribe. */
export const DEMORA_RESPUESTA_MS = 600;

const respuestas: { claves: string[]; texto: string }[] = [
  {
    claves: ["racha", "perdi un dia", "recuperar"],
    texto:
      "Tu racha sube cada dia que depositas el monto de tu plan o compras 1 UFV. Si fallas un dia, tienes 24 horas para recuperarla poniendo lo de ayer mas lo de hoy.",
  },
  {
    claves: ["puntos", "canje", "canjear", "megas", "descuento"],
    texto:
      "La racha te da puntos por constancia, no por monto. Puedes canjearlos por megas, descuentos en negocios aliados o UFV extra para tu meta.",
  },
  {
    claves: ["qr", "deposit", "transferir", "transferencia", "minimo"],
    texto:
      "Puedes pasar dinero de tu caja de ahorros a tu cuenta en UFV con QR desde la seccion UFVs, sin ir al banco. El deposito minimo es de 30 UFV.",
  },
  {
    claves: ["cuanto vale", "valor de la ufv", "subio", "crecio", "historial", "2020"],
    texto:
      "En la seccion UFVs ves el valor de la UFV y como fue subiendo. Hay un ejemplo de cuanto valen hoy 100 UFV ahorradas en 2020.",
  },
  {
    claves: ["5%", "porcentaje", "automatico", "subcuenta", "cada ingreso", "me pagaron", "cobre"],
    texto:
      "Cada vez que recibes un ingreso te sugiero ahorrar un 5%. Puedes subir o bajar ese porcentaje, y lo ahorrado va a una subcuenta para tus metas o servicios.",
  },
  {
    claves: ["luz", "agua", "servicio", "internet", "factura"],
    texto:
      "Puedes destinar tu ahorro pasivo a un servicio, por ejemplo la luz. Te aviso cuando la meta este completa para que lo pagues con lo ahorrado.",
  },
  {
    claves: ["categoria", "tipo de pago", "motivo", "reporte", "en que gasto", "en que gaste", "resumen"],
    texto:
      "Al pagar, elige un motivo: comida, estudio, entretenimiento, tecnologia u otro. A fin de mes te muestro un reporte de en que se fue tu dinero.",
  },
  {
    claves: ["sueldo", "salario", "gastos fijos", "fin de mes", "alquiler", "presupuesto", "hijos", "dependientes"],
    texto:
      "Al inicio del mes llena el formulario de gastos fijos: sueldo, alquiler, servicios, suscripciones y dependientes. Con eso te armo un plan para llegar a fin de mes y ahorrar.",
  },
  {
    claves: ["meta", "quiero comprar", "quiero ahorrar para", "playstation", "ps5", "celular", "laptop", "viaje"],
    texto:
      "Cuentame que quieres comprar y para que fecha. Con el precio y tus gastos te armo un plan de ahorro mensual y semanal para lograrlo.",
  },
  {
    claves: ["gracias"],
    texto: "De nada. Aqui estoy cuando quieras revisar tus ahorros.",
  },
  {
    claves: ["ufv"],
    texto:
      "La UFV (Unidad de Fomento de Vivienda) es una unidad que sube con la inflación. Si ahorras en UFV, tu dinero mantiene su valor en el tiempo",
  },
  {
    claves: ["hormiga", "gustito", "cafe", "café"],
    texto:
      "Los gastos hormiga son pequeños pero suman mucho. Pon un tope semanal a tu bolsillo de Gustitos y revisa cada domingo cuánto llevas.",
  },
  {
    claves: ["consejo", "tip", "ayuda"],
    texto:
      "Apenas cobres, separa primero tu ahorro y después reparte lo demás. ¡Ahorrar primero es la regla de oro!",
  },
  {
    claves: ["hola", "buenas"],
    texto: "¡Hola! Soy tu mascota financiera. Pregúntame lo que quieras sobre tus gastos y ahorros",
  },
];

/* ---------------------------------------------------------
   Conversacion por pasos para armar una meta de ahorro:
   producto -> precio -> plazo -> plan.
   El estado vive en memoria: se reinicia al recargar o cambiar de pagina.
   --------------------------------------------------------- */

interface MetaEnCurso {
  paso: "precio" | "plazo";
  producto: string;
  precioBs?: number;
}

let metaEnCurso: MetaEnCurso | null = null;

const formatoBs = new Intl.NumberFormat("es-BO", { useGrouping: "always" });

/** Minusculas y sin tildes, para que "depósito" coincida con "deposito". */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** "quiero ahorrar para una compu" -> "compu". Devuelve null si no hay producto. */
function extraerProducto(texto: string): string | null {
  const encontrado = texto.match(
    /(?:ahorrar para|comprar(?:me)?|juntar para)\s+(?:(?:un|una|unos|unas|el|la|los|las|mi|mis)\s+)?([a-z0-9 ]+)/,
  );
  const producto = encontrado?.[1].trim();
  return producto ? producto : null;
}

/** "4.850", "4850 Bs" o "5 mil" -> numero. Devuelve null si no hay numero. */
function extraerMonto(texto: string): number | null {
  const sinMiles = texto.replace(/(\d)\.(\d{3})\b/g, "$1$2");
  const encontrado = sinMiles.match(/\d+(?:,\d+)?/);
  if (!encontrado) return null;
  const monto = Number(encontrado[0].replace(",", "."));
  return /\bmil\b/.test(texto) ? monto * 1000 : monto;
}

/** "6 meses", "en 6" o "1 ano" -> meses. Devuelve null si no se entiende. */
function extraerMeses(texto: string): number | null {
  const anos = texto.match(/(\d+|un)\s*anos?\b/);
  if (anos) return (anos[1] === "un" ? 1 : Number(anos[1])) * 12;
  const meses = texto.match(/\d+/);
  return meses ? Number(meses[0]) : null;
}

function continuarMeta(meta: MetaEnCurso, texto: string): string {
  if (meta.paso === "precio") {
    const precio = extraerMonto(texto);
    if (!precio || precio <= 0) {
      return "No entendi el precio. Escribelo en numeros, por ejemplo: 4500.";
    }
    meta.precioBs = precio;
    meta.paso = "plazo";
    return `Anotado: Bs ${formatoBs.format(precio)}. En cuantos meses quieres tener tu ${meta.producto}?`;
  }

  const meses = extraerMeses(texto);
  if (!meses || meses <= 0) {
    return "No entendi el plazo. Dime cuantos meses, por ejemplo: 6 meses.";
  }
  const precio = meta.precioBs ?? 0;
  const mensual = Math.ceil(precio / meses);
  const semanal = Math.ceil(precio / ((meses * 52) / 12));
  metaEnCurso = null;
  return (
    `Tu plan para ${meta.producto}: ahorra Bs ${formatoBs.format(mensual)} al mes ` +
    `(unos Bs ${formatoBs.format(semanal)} por semana) durante ${meses} meses. ` +
    "Si separas el ahorro apenas cobras, llegas mas facil."
  );
}

export async function obtenerRespuesta(mensaje: string): Promise<string> {
  const texto = normalizar(mensaje);
  await new Promise((r) => setTimeout(r, 600)); // simula "escribiendo..."

  if (/\b(cancelar|olvidalo|otra cosa)\b/.test(texto) && metaEnCurso) {
    metaEnCurso = null;
    return "Listo, deje esa meta. En que mas te ayudo?";
  }

  if (metaEnCurso) return continuarMeta(metaEnCurso, texto);

  const producto = extraerProducto(texto);
  if (producto) {
    metaEnCurso = { paso: "precio", producto };
    return `Buena meta: ${producto}. Cuanto cuesta mas o menos, en Bs?`;
  }

  const coincidencia = respuestas.find((r) => r.claves.some((c) => texto.includes(c)));
  return (
    coincidencia?.texto ??
    "Todavía estoy aprendiendo. Prueba preguntándome por la UFV, tus gastos hormiga o pídeme un consejo."
  );
}
