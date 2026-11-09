import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // El SDK de Firestore solo pesa ~160 KB comprimido; subimos el umbral del aviso.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Separa las librerías grandes en archivos propios: se cachean
        // aparte y el navegador las descarga en paralelo.
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/]@?firebase/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'ui', test: /node_modules[\\/](react-bootstrap|@restart|@popperjs|styled-components|react-icons|react-toastify|react-helmet-async)/ },
          ],
        },
      },
    },
  },
})
