// vite.config.js
// Vite configuration with Tailwind CSS v4 plugin support

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 via Vite plugin
  ],
})
