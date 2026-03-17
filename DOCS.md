# Documentación técnica — La Colmena Market

## Índice

1. [Visión general](#visión-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Arquitectura](#arquitectura)
5. [Flujo de datos](#flujo-de-datos)
6. [Páginas y rutas](#páginas-y-rutas)
7. [Componentes](#componentes)
8. [Estado del cliente (Stores)](#estado-del-cliente-stores)
9. [APIs y endpoints](#apis-y-endpoints)
10. [Servicios externos](#servicios-externos)
11. [Esquemas de validación](#esquemas-de-validación)
12. [Estilos y tema](#estilos-y-tema)

---

## Visión general

La Colmena Market es una tienda en línea de productos naturales elaborados a partir de miel. Los clientes navegan el catálogo, agregan productos al carrito y finalizan su compra a través de WhatsApp. El sistema genera un ticket persistente en base de datos y redirige al cliente a WhatsApp con un mensaje prellenado.

---

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| **Astro 5** | Framework principal (SSG + SSR híbrido) |
| **Alpine.js** | Interactividad del cliente (carrito, tooltips, acordeones, carrusel) |
| **Tailwind CSS 4** | Estilos utilitarios |
| **Nanostores** | Estado persistente del carrito y tema (localStorage) |
| **Hygraph (GraphQL)** | CMS headless para productos y categorías |
| **Cloudinary** | Hosting y transformación de imágenes de productos |
| **Turso (libSQL)** | Base de datos SQLite para tickets de pedidos |
| **Upstash Redis** | Cache para control de jobs de rebuild |
| **Upstash QStash** | Cola de mensajes para disparar rebuilds en Vercel |
| **Vercel** | Hosting y deploy (adapter `@astrojs/vercel`) |
| **Astro Actions** | Server actions para finalizar pedidos |
| **Zod** | Validación de formularios (checkout) |

---

## Estructura del proyecto

```
src/
├── actions/              # Astro Actions (server-side)
│   └── index.ts          # finalizeTicket — guarda pedido en Turso y genera URL WhatsApp
├── assets/               # Imágenes estáticas (hero)
├── components/
│   ├── NavBar.astro      # Barra de navegación (desktop + mobile)
│   ├── cart/             # Componentes del flujo de checkout
│   │   ├── EmptyCart.astro
│   │   ├── OrderSummary.astro
│   │   ├── Step1.astro   # Revisión del pedido
│   │   ├── Step2.astro   # Datos del cliente
│   │   ├── Step3.astro   # Dirección de entrega
│   │   ├── Step4.astro   # Confirmación
│   │   └── Stepper.astro # Indicador de pasos
│   └── ui/               # Componentes UI reutilizables
│       ├── AddressOption.astro
│       ├── BackButton.astro
│       ├── Badge.astro
│       ├── Breadcrumb.astro
│       ├── Button.astro
│       ├── Card.astro
│       ├── Drawer.astro  # Panel lateral/inferior del carrito
│       ├── Dropdown.astro
│       ├── FormInput.astro
│       ├── InputNumber.astro
│       └── Tooltip.astro
├── features/
│   ├── categories/
│   │   └── categories.api.ts   # Query GraphQL para categorías
│   └── products/
│       ├── Products.astro       # Lista de productos con búsqueda
│       ├── products.api.ts      # Query GraphQL para productos
│       ├── products.model.ts    # Tipos TypeScript (Product, Image, Category)
│       └── components/
│           ├── Carousel.astro       # Carrusel de imágenes del producto
│           ├── CardDrawerItems.astro # Items del carrito en el drawer
│           ├── ProductCard.astro     # Tarjeta de producto
│           ├── ProductDetails.astro  # Acordeón de detalles (Alpine x-collapse)
│           └── Tags.astro           # Etiquetas del producto
├── layouts/
│   ├── Layout.astro          # Layout principal (head, nav, footer, drawer)
│   └── ProductsLayout.astro  # Layout para páginas de catálogo
├── lib/
│   ├── QStash.ts         # Cliente QStash (schedule rebuild, verify signature)
│   ├── db/
│   │   └── turso.ts      # Cliente Turso (libSQL)
│   ├── hygraph.ts        # Cliente GraphQL para Hygraph
│   ├── redis.ts          # Cliente Redis (control de jobs)
│   ├── scripts/
│   │   ├── cart.ts       # Alpine data handler del checkout (cartHandler)
│   │   └── client-init.ts # Inicialización Alpine: plugins, stores, handlers
│   └── utils/
│       └── cart.order.ts  # Lógica de validación de pasos y finalización
├── pages/
│   ├── index.astro       # Home: hero, features, productos destacados
│   ├── cart/
│   │   ├── cart.config.ts    # Direcciones de entrega y pasos del stepper
│   │   └── index.astro       # Página del carrito (checkout 4 pasos)
│   ├── pedidos/
│   │   └── [ticket].astro    # Página de detalle del ticket (SSR)
│   ├── product/
│   │   └── [type]/
│   │       ├── index.astro   # Catálogo por categoría
│   │       └── [id].astro    # Detalle del producto
│   └── api/
│       ├── run-build.ts      # Endpoint para verificar rebuild de QStash
│       └── upstash-queue.ts  # Webhook de Hygraph → schedule rebuild
├── schemas/
│   └── checkout.ts       # Schemas Zod (step2, step3, checkout)
├── store/
│   ├── cartStore.ts      # Nanostore persistente del carrito
│   └── themeStore.ts     # Nanostore persistente del tema (dark/light)
├── styles/
│   └── global.css        # Variables CSS del tema, Tailwind config, utilidades
├── alpine.d.ts           # Tipos para plugins Alpine
└── types.d.ts            # Tipos globales (Window, Alpine store)
```

---

## Arquitectura

### Rendering

- **Páginas estáticas (SSG):** Home, catálogo por categoría, detalle de producto, carrito.
- **Páginas dinámicas (SSR):** Página de ticket (`/pedidos/[ticket]`), endpoints API.
- **Client Router:** Astro Client Router para transiciones suaves entre páginas.

### Interactividad

Alpine.js maneja toda la interactividad del cliente:
- **`cartStore`** — Store Alpine sincronizado con Nanostores (persistente en localStorage).
- **`themeStore`** — Toggle dark/light mode.
- **`catalogHandler`** — Búsqueda y paginación infinita de productos.
- **`inputNumberHandler`** — Control de cantidad con límite de compra.
- **`cartHandler`** — Flujo de checkout multi-paso con validación.

---

## Flujo de datos

### Productos (build time)

```
Hygraph CMS → GraphQL API → Astro (getProducts/getCategories) → HTML estático
```

### Carrito (client-side)

```
Usuario agrega producto → Alpine store → Nanostores → localStorage
```

### Checkout (client → server)

```
1. Usuario completa 4 pasos (Alpine cartHandler)
2. Astro Action `finalizeTicket` se ejecuta en el servidor
3. Se valida con Zod, se guarda en Turso (SQLite)
4. Se genera mensaje WhatsApp y URL del ticket
5. Se redirige a /pedidos/[ticketId]?openWa=1
6. La página abre WhatsApp automáticamente
```

### Rebuild automático (webhook)

```
1. Se edita contenido en Hygraph CMS
2. Hygraph envía webhook → POST /api/upstash-queue
3. Se verifica firma, se cancela job anterior en Redis
4. Se agenda rebuild en QStash (con delay configurable)
5. QStash dispara → Vercel Deploy Hook → nuevo build
```

---

## Páginas y rutas

| Ruta | Archivo | Tipo | Descripción |
|---|---|---|---|
| `/` | `pages/index.astro` | SSG | Home con hero, features y productos destacados |
| `/product/[type]` | `pages/product/[type]/index.astro` | SSG | Catálogo filtrado por categoría |
| `/product/[type]/[id]` | `pages/product/[type]/[id].astro` | SSG | Detalle del producto |
| `/cart` | `pages/cart/index.astro` | SSG | Carrito y checkout (4 pasos) |
| `/pedidos/[ticket]` | `pages/pedidos/[ticket].astro` | SSR | Ticket del pedido |
| `/api/upstash-queue` | `pages/api/upstash-queue.ts` | SSR | Webhook Hygraph → QStash |
| `/api/run-build` | `pages/api/run-build.ts` | SSR | Verificación de rebuild QStash |

---

## Componentes

### UI (`components/ui/`)

| Componente | Descripción |
|---|---|
| `Button` | Botón polimórfico (`<a>` o `<button>`) con 9 variantes |
| `Card` | Contenedor con borde, slots para header/footer |
| `Drawer` | Panel del carrito: lateral en desktop, inferior en mobile |
| `InputNumber` | Control +/- con límite de compra y tooltip |
| `FormInput` | Input con label, validación Alpine y error Zod |
| `Dropdown` | Selector de cantidad con Alpine |
| `Tooltip` | Tooltip posicionado con `@alpinejs/anchor` |
| `Breadcrumb` | Migas de pan con esquema accesible |
| `Badge` | Etiqueta con variantes de color |
| `BackButton` | Botón "volver" con `history.back()` |
| `AddressOption` | Radio button estilizado para puntos de entrega |

### Productos (`features/products/components/`)

| Componente | Descripción |
|---|---|
| `ProductCard` | Tarjeta responsive (layout distinto mobile/desktop) |
| `Carousel` | Carrusel de imágenes con autoplay y controles |
| `ProductDetails` | Acordeón con descripción, beneficios e instrucciones |
| `CardDrawerItems` | Lista de items del carrito dentro del drawer |
| `Tags` | Renderiza badges de etiquetas del producto |

---

## Estado del cliente (Stores)

### `cartStore` (`store/cartStore.ts`)

Estado persistente en `localStorage` vía `@nanostores/persistent`.

```typescript
interface Cart {
  items: Record<string, CartItem>  // id → item
  total: number
}
interface CartItem {
  title: string
  price: number
  quantity: number
  purchaseLimit: number
  imgUrl: string
  categoryId: Category
}
```

**Acciones:** `addItem()`, `removeItem()`, `clearCart()`

### `themeStore` (`store/themeStore.ts`)

Atom persistente para dark/light mode. Se sincroniza con Alpine store.

---

## APIs y endpoints

### `POST /api/upstash-queue`

Recibe webhooks de Hygraph cuando se modifica contenido. Verifica la firma, cancela el job anterior si existe, y agenda un nuevo rebuild con delay.

### `POST /api/run-build`

Recibe la ejecución programada de QStash. Verifica firma y ejecuta lógica de rebuild.

### Astro Action: `finalizeTicket`

Server action que:
1. Valida input con Zod
2. Busca la dirección de entrega
3. Genera UUID para el ticket
4. Construye mensaje WhatsApp
5. Guarda todo en Turso
6. Retorna `ticketId` y `whatsappUrl`

---

## Servicios externos

| Servicio | Uso | Variables de entorno |
|---|---|---|
| **Hygraph** | CMS headless (productos, categorías) | `HYGRAPH_TOKEN`, `HYGRAPH_API_URL`, `HYGRAPH_SIGNATURE` |
| **Cloudinary** | CDN de imágenes con transformaciones on-the-fly | (configurado en Hygraph) |
| **Turso** | BD SQLite para tickets de pedidos | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| **Upstash Redis** | Cache de job IDs de QStash | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Upstash QStash** | Cola de mensajes para rebuilds | `QSTASH_TOKEN`, `QSTASH_*` |
| **Vercel** | Hosting y deploy hooks | `VERCEL_DEPLOY_HOOK_URL` |
| **WhatsApp** | Canal de venta (mensaje prellenado) | `WHATSAPP_TO_NUMBER` |

---

## Esquemas de validación

Definidos en `schemas/checkout.ts` con Zod:

- **`step2Schema`** — `name` (min 3), `phone` (10-15 dígitos, opcional), `note` (max 300, opcional)
- **`step3Schema`** — `addressId` (requerido)
- **`checkoutSchema`** — Combinación completa

La validación ocurre tanto en el cliente (Alpine `validateField`) como en el servidor (Astro Action).

---

## Estilos y tema

### Sistema de colores

Definido en `styles/global.css` con variables CSS HSL para soporte de opacidad:

- **Modo claro:** Tonos cálidos (ámbar/miel) sobre fondo crema.
- **Modo oscuro:** Tonos oscuros con acentos dorados.

### Colores principales

| Token | Descripción |
|---|---|
| `--primary` | Ámbar dorado principal |
| `--honey-light/medium/dark` | Tonos de miel para decoración |
| `--gradient-primary` | Gradiente ámbar → amarillo |
| `--gradient-warm` | Gradiente cálido para fondos |

### Utilidades custom

- `gradient-primary` — Aplica gradiente principal.
- `gradient-warm` — Aplica gradiente cálido de fondo.
- `[x-cloak] { display: none !important }` — Oculta elementos Alpine no inicializados.
