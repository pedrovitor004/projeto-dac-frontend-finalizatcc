import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // <--- MUDOU AQUI
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
