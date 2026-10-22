import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Every source file, so the ones no test loads show up as untested.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/client/**",
        "src/routeTree.gen.ts",
        "src/components/ui/**",
      ],
    },
  },
})
