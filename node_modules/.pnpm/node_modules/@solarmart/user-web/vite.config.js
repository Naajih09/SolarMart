import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@solarmart/shared": path.resolve(__dirname, "../../packages/shared/src/index.js"),
      "@solarmart/shared/styles.css": path.resolve(__dirname, "../../packages/shared/src/index.css"),
    },
  },
});
