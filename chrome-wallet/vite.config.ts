import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

function manifestPlugin(): Plugin {
  return {
    name: 'manifest-generator',
    closeBundle: async () => {
      const manifest = await import('./src/manifest.js');
      writeFileSync('dist/manifest.json', JSON.stringify(manifest.default, null, 2));
    }
  };
}

export default defineConfig({
  plugins: [react(), manifestPlugin()],
  base: './', // Rutas relativas para extensiones Chrome
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        notification: './notification.html',
        connect: './connect.html',
        background: 'src/background.ts',
        'content-script': 'src/content-script.ts',
        inject: 'src/inject.ts',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (
            chunkInfo.name === 'background' ||
            chunkInfo.name === 'content-script' ||
            chunkInfo.name === 'inject'
          ) {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

