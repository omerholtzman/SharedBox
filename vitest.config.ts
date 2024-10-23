import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'], // Use the setup file globally
    globals: true, // Enable global mode for test functions
  },
});