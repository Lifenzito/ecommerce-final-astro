// Configuracion principal de Astro
// Usamos modo 'server' para que las paginas publicas usen SSR por defecto.
// Las paginas del admin se marcan como prerender = true para generar HTML estatico.
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  // Modo servidor: todas las paginas usan SSR a menos que indiquemos lo contrario
  output: "server",

  // Adaptador de Cloudflare para desplegar en Cloudflare Pages
  adapter: cloudflare({
    imageService: "passthrough",
  }),

  integrations: [
    // React para componentes interactivos del admin (formularios, CRUD)
    react(),
    // TailwindCSS para estilos
    tailwind(),
  ],
});
