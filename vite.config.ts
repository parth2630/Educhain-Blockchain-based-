import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import environment from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    environment({
      VITE_CONTRACT_ADDRESS: '',
      VITE_SEPOLIA_RPC_URL: '',
      VITE_PAYROLL_CONTRACT_ADDRESS: '',
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3001,
    strictPort: true,
    host: 'localhost',
    open: true,
  }
});
