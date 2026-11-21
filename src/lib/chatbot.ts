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
    claves: ["ufv"],
    texto:
      "La UFV (Unidad de Fomento de Vivienda) es una unidad que sube con la inflación. Si ahorras en UFV, tu dinero mantiene su valor en el tiempo 💪",
  },
  {
    claves: ["hormiga", "gustito", "cafe", "café"],
    texto:
      "Los gastos hormiga son pequeños pero suman mucho. Pon un tope semanal a tu bolsillo de Gustitos y revisa cada domingo cuánto llevas 🐜",
  },
  {
    claves: ["consejo", "tip", "ayuda"],
    texto:
      "Apenas cobres, separa primero tu ahorro y después reparte lo demás. ¡Ahorrar primero es la regla de oro! ✨",
  },
  {
    claves: ["hola", "buenas"],
    texto: "¡Hola! Soy tu mascota financiera. Pregúntame lo que quieras sobre tus gastos y ahorros 🙌",
  },
];

export async function obtenerRespuesta(mensaje: string): Promise<string> {
  const texto = mensaje.toLowerCase();
  await new Promise((r) => setTimeout(r, 600)); // simula "escribiendo..."
  const coincidencia = respuestas.find((r) => r.claves.some((c) => texto.includes(c)));
  return (
    coincidencia?.texto ??
    "Todavía estoy aprendiendo 🤓. Prueba preguntándome por la UFV, tus gastos hormiga o pídeme un consejo."
  );
}
