import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/BoutiqueEye/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalogo: resolve(__dirname, 'catalogo.html'),
      },
    },
  },
})