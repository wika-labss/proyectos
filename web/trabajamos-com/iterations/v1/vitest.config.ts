import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Las pruebas de integración comparten una base de prueba.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
