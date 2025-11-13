// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      HYGRAPH_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: false,
        default: "INFORM_VALID_TOKEN",
      }),
      HYGRAPH_API_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
        default: "INFORM_VALID_TOKEN",
      }),
    },
  },
});
