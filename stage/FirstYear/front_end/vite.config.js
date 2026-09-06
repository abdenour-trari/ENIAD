import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true, // permet d’accéder depuis d’autres appareils
    port: 5173, // ton port dev
    allowedHosts: ["gyrostatically-sublumbar-leslie.ngrok-free.dev"], // autorise ngrok
  },
});
