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
      "Los gastos hormiga son pequeños pero suman mucho. Pon un tope semanal a tu bolsillo de Gustitos y revisa cada domingo cuánto llevas 🐜",
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

export async function obtenerRespuesta(mensaje: string): Promise<string> {
    const texto = mensaje
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  await new Promise((r) => setTimeout(r, 600)); // simula "escribiendo..."
  const coincidencia = respuestas.find((r) => r.claves.some((c) => texto.includes(c)));
  return (
    coincidencia?.texto ??
    "Todavía estoy aprendiendo. Prueba preguntándome por la UFV, tus gastos hormiga o pídeme un consejo."
  );
}
