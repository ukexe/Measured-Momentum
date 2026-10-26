import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    css: true,
    environment: "jsdom",
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/component/**/*.test.{ts,tsx}",
    ],
    restoreMocks: true,
    setupFiles: ["./tests/setup.ts"],
  },
});
