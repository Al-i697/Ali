import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@shared': r('./src/shared'), '@': r('./src/web') },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: 'forks',
  },
});
