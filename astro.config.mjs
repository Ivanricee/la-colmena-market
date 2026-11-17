// @ts-check
import { defineConfig, envField } from 'astro/config'
import { copyFile, readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

import icon from 'astro-icon'

import alpinejs from '@astrojs/alpinejs'
import sitemap from '@astrojs/sitemap'
import { AstroPWAIntegration } from '@vite-pwa/astro'

/** @type {import('astro').AstroIntegration} */
const vercelPwaAssets = {
  name: 'vercel-pwa-assets',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const staticDir = fileURLToPath(dir)
      const buildDir = resolve(staticDir, '..')
      const files = await readdir(buildDir)
      const workboxFiles = files.filter((file) => /^workbox-.*\.js$/.test(file))

      if (!files.includes('sw.js') || workboxFiles.length === 0) {
        throw new Error('Expected generated PWA service worker and Workbox assets')
      }

      let adjustedEntries = 0
      const serviceWorker = (await readFile(resolve(buildDir, 'sw.js'), 'utf8'))
        .replace(/url:`client\/([^`]+)`/g, (_, url) => {
          adjustedEntries += 1
          return 'url:`' + url + '`'
        })
        .replace(/url:`client`/g, () => {
          adjustedEntries += 1
          return 'url:`/`'
        })

      if (adjustedEntries === 0) {
        throw new Error('Expected client-prefixed PWA precache entries')
      }

      await writeFile(resolve(staticDir, 'sw.js'), serviceWorker)
      await Promise.all(
        workboxFiles.map((file) => copyFile(resolve(buildDir, file), resolve(staticDir, file)))
      )
    },
  },
}

// https://astro.build/config
export default defineConfig({
  site: 'https://lacolmenamarket.shop',
  output: 'static',
  prefetch: true,
  adapter:
    vercel(/*{
    webAnalytics: { enabled: true },
  }*/),

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      HYGRAPH_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      HYGRAPH_API_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      HYGRAPH_SIGNATURE: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_CURRENT_SIGNING_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_NEXT_SIGNING_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      UPSTASH_REDIS_REST_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_QUEUE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_BUILD_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_DELAY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      QSTASH_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      VERCEL_DEPLOY_HOOK_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      WHATSAPP_TO_NUMBER: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      TURSO_DATABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      TURSO_AUTH_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      PUBLIC_SITE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
    },
  },

  integrations: [
    icon(),
    alpinejs(),
    sitemap(),
    AstroPWAIntegration({
      injectRegister: 'script',
      registerType: 'autoUpdate',
      manifest: {
        name: 'La Colmena Market',
        short_name: 'La Colmena',
        start_url: '/',
        display: 'standalone',
        background_color: '#19140F',
        theme_color: '#19140E',
        lang: 'es-MX',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      pwaAssets: {
        disabled: true,
        injectThemeColor: false,
      },
      includeManifestIcons: false,
      generateSW: {
        // Empty disables Astro's default "/" navigation fallback.
        navigateFallback: '',
        globPatterns: ['**/*.{html,js,css,svg,ico,png,jpg,jpeg,webp,avif,woff,woff2,ttf,otf,txt}'],
        globIgnores: ['**/api/**'],
      },
    }),
    vercelPwaAssets,
  ],
})
