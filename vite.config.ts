import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";
import path from "node:path";

const r = (p: string) => path.resolve(fileURLToPath(new URL(p, import.meta.url)));

export default defineConfig({
  plugins: [
    react(),
    // Đồng bộ alias từ tsconfig (paths: { "@/*": ["src/*"] })
    tsconfigPaths(),
  ],
  resolve: {
    // Thêm alias thủ công để “chắn” mọi case
    alias: { "@": r("./src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
