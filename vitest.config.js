import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // No global setup — each test file handles its own mocking
    setupFiles: [],
    include: [
      "extension/test/**/*.test.{js,ts}"
    ],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "extension/src/**/*.ts",
        "!extension/test/**",
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
      },
    },
  },
});