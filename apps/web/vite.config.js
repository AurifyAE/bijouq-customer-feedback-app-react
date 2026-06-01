import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: "https://script.google.com", // base domain only
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api/, `/macros/s/AKfycbwD3jPrCO2o6JP0PGUdVay0-u_ur-zVv8B4RgIFrOqBk91CDdZXWoGZcIkNcEIut5Lg/exec`),
        },
      },
    },
  }
})
