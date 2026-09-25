/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const brandBuildModes = new Set(['bayer', 'egis']);

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && !brandBuildModes.has(mode)) {
    throw new Error('Use a brand-specific build command: npm run build:bayer or npm run build:egis.');
  }

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
