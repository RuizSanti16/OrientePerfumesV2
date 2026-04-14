import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /* Redirige /api/* al servidor PHP de XAMPP */
      '/api': {
        target: 'http://localhost/OrientPerfumesV2/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
});