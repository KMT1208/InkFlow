import { defineConfig } from "vitest/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.ts"],
  },
  resolve: {
    // Aligne l'alias "@/" sur le tsconfig (paths: { "@/*": ["./*"] }).
    alias: { "@": rootDir },
  },
});
