import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './tests',
    include: ['**/*-spec.ts'],
    globals: true
  }
});
