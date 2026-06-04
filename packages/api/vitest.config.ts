import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: "tests/setup.ts",
    // integration tests share a real DB — parallel execution causes race conditions
    fileParallelism: false,
  },
});
