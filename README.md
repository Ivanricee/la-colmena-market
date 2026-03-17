# La Colmena Market

Tienda en línea de productos naturales elaborados a partir de miel. Los clientes navegan el catálogo, agregan productos al carrito y finalizan su compra directamente por WhatsApp.

## Características

- **Catálogo de productos** con búsqueda en tiempo real y paginación infinita
- **Carrito persistente** en localStorage (no se pierde al cerrar el navegador)
- **Checkout en 4 pasos:** revisión → datos del cliente → punto de entrega → confirmación
- **Finalización por WhatsApp** con mensaje prellenado y ticket persistente
- **Modo oscuro/claro** con toggle y persistencia
- **Diseño responsive** con drawer lateral (desktop) e inferior (mobile) para el carrito
- **Imágenes optimizadas** vía Cloudinary con transformaciones on-the-fly
- **Rebuild automático** cuando se edita contenido en el CMS (Hygraph → QStash → Vercel)
- **SEO optimizado** con sitemap, meta tags, Open Graph y robots.txt

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| [Astro 5](https://astro.build) | Framework (SSG + SSR híbrido) |
| [Alpine.js](https://alpinejs.dev) | Interactividad del cliente |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilos |
| [Nanostores](https://github.com/nanostores/nanostores) | Estado persistente (carrito, tema) |
| [Hygraph](https://hygraph.com) | CMS headless (GraphQL) |
| [Cloudinary](https://cloudinary.com) | CDN de imágenes |
| [Turso](https://turso.tech) | Base de datos SQLite (tickets) |
| [Upstash](https://upstash.com) | Redis + QStash (cache y colas) |
| [Vercel](https://vercel.com) | Hosting y deploy |

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 8
- Cuentas en: Hygraph, Cloudinary, Turso, Upstash, Vercel

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Ivanricee/la-colmena-market.git
cd la-colmena-market

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

## Variables de entorno

Consulta `.env.example` para la lista completa. Las principales son:

| Variable | Descripción |
|---|---|
| `HYGRAPH_API_URL` | URL de la API GraphQL de Hygraph |
| `HYGRAPH_TOKEN` | Token de acceso a Hygraph |
| `HYGRAPH_SIGNATURE` | Clave para verificar webhooks de Hygraph |
| `TURSO_DATABASE_URL` | URL de la base de datos Turso |
| `TURSO_AUTH_TOKEN` | Token de autenticación de Turso |
| `WHATSAPP_TO_NUMBER` | Número de WhatsApp destino (sin +, ej: `525512345678`) |
| `PUBLIC_SITE_URL` | URL pública del sitio (sin trailing slash) |
| `QSTASH_*` | Credenciales de Upstash QStash |
| `UPSTASH_REDIS_*` | Credenciales de Upstash Redis |
| `VERCEL_DEPLOY_HOOK_URL` | URL del deploy hook de Vercel |

## Comandos

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de producción en `./dist/` |
| `pnpm preview` | Preview del build local |
| `pnpm check` | Verificación de tipos con Astro |
| `pnpm lint` | Linter con ESLint |
| `pnpm format` | Formateo con Prettier |

## Estructura del proyecto

```
src/
├── actions/          # Server actions (finalizeTicket)
├── components/
│   ├── NavBar.astro  # Navegación principal
│   ├── cart/         # Componentes del checkout (4 pasos)
│   └── ui/           # Componentes UI reutilizables
├── features/
│   ├── categories/   # API de categorías (Hygraph)
│   └── products/     # API, modelo y componentes de productos
├── layouts/          # Layout principal y de catálogo
├── lib/
│   ├── db/           # Cliente Turso
│   ├── scripts/      # Inicialización Alpine y lógica del carrito
│   └── utils/        # Utilidades de checkout
├── pages/            # Rutas (home, catálogo, producto, carrito, pedidos, API)
├── schemas/          # Validación Zod (checkout)
├── store/            # Nanostores (carrito, tema)
└── styles/           # Variables CSS del tema
```

## Flujo de compra

1. El usuario navega el catálogo y agrega productos al carrito
2. En `/cart`, completa 4 pasos: revisión, datos personales, punto de entrega, confirmación
3. Al confirmar, un Astro Action guarda el ticket en Turso y genera un mensaje para WhatsApp
4. El usuario es redirigido a `/pedidos/[ticket]` donde puede abrir WhatsApp con el mensaje prellenado
5. La venta continúa por WhatsApp directamente con el vendedor

## Rebuild automático

Cuando se edita contenido en Hygraph:

1. Hygraph envía un webhook a `POST /api/upstash-queue`
2. Se verifica la firma y se agenda un rebuild con delay en QStash
3. Si ya había un rebuild pendiente, se cancela el anterior (debounce)
4. QStash dispara el deploy hook de Vercel para generar un nuevo build

## Documentación adicional

- **[DOCS.md](./DOCS.md)** — Documentación técnica detallada (arquitectura, componentes, stores, APIs)
- **[PAGESPEED_MANUAL_FIXES.md](./PAGESPEED_MANUAL_FIXES.md)** — Tareas manuales para optimizar PageSpeed
