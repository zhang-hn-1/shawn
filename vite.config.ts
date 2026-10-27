import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "share-2026-entry",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const [pathname] = (request.url ?? "").split("?");
          if (pathname === "/2026" || pathname === "/2026/") {
            request.url = "/2026/index.html";
          }
          next();
        });
      },
    },
  ],
  base: "./",
  build: {
    sourcemap: true,
  },
});
