# App de ahorro en UFV (Hackathon)

Astro + TypeScript + Tailwind CSS v4.

```sh
npm install
npm run dev     # http://localhost:4321
```

## Estructura

```
src/
├─ pages/                 # una ruta por sección
│  ├─ index.astro         # Inicio   → /
│  ├─ pagos/index.astro   # Pagos    → /pagos
│  ├─ ahorro/index.astro  # Ahorro   → /ahorro
│  ├─ ufvs/index.astro    # UFVs     → /ufvs
│  └─ perfil/index.astro  # Perfil   → /perfil
├─ components/
│  ├─ inicio/ pagos/ ahorro/ ufvs/ perfil/   # ← cada uno trabaja en SU carpeta
│  ├─ ui/                 # piezas compartidas (Icono, botones, tarjetas...)
│  ├─ layout/             # BarraInferior
│  └─ chatbot/            # ChatFlotante (botón + panel de la mascota)
├─ layouts/AppLayout.astro  # envuelve cada página (incluye barra y chat)
├─ data/navegacion.ts     # pestañas de la barra inferior
├─ lib/chatbot.ts         # respuestas del bot (cambiar por la API real)
├─ types/                 # tipos TypeScript compartidos
└─ styles/global.css      # TOKENS de diseño (colores, sombras, clases)
public/img/mascota/       # imágenes de la mascota
```

Cada página usa:

```astro
---
import AppLayout from "../../layouts/AppLayout.astro";
---
<AppLayout titulo="Pagos"> ...tu contenido... </AppLayout>
```

## Guía de estilo (usar estos tokens, no colores sueltos)

| Uso | Clase Tailwind |
|---|---|
| Fondo crema / tarjeta blanca | `bg-fondo` / `bg-superficie` |
| Texto y bordes oscuros | `text-tinta`, `border-tinta` |
| Texto secundario | `text-tinta-suave` |
| Primario índigo | `bg-primario`, `bg-primario-claro`, `bg-primario-suave` |
| Casi al límite (amarillo) | `bg-alerta`, `bg-alerta-suave` |
| Excedido (rojo) | `text-peligro`, `bg-peligro-suave` |
| Bien (verde) | `bg-exito`, `bg-exito-suave` |
| Botón principal terracota | `btn-accion` |
| Tarjeta con borde + sombra dura | `tarjeta` |
| Etiqueta tipo píldora | `chip` |
| Sombras duras | `shadow-duro-sm`, `shadow-duro`, `shadow-duro-lg` |

Fuente: **Plus Jakarta Sans**. Títulos `font-extrabold`, bordes `border-2 border-tinta`, esquinas `rounded-2xl`.

Ejemplo:

```html
<div class="tarjeta p-4">
  <h3 class="font-bold">Comida</h3>
  <span class="chip bg-alerta-suave">Casi al límite</span>
</div>
<button class="btn-accion w-full py-4">Repartir sueldo</button>
```
