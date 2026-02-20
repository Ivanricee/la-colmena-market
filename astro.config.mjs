// @ts-check
import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

import icon from 'astro-icon'

import alpinejs from '@astrojs/alpinejs'

// https://astro.build/config
export default defineConfig({
  output: 'static',

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

  integrations: [icon(), alpinejs()],
})
