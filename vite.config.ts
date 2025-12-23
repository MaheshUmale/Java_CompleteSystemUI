
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    // Since we use importmap for some deps, we exclude them from pre-bundling
    exclude: ['recharts', 'lucide-react', 'lightweight-charts', 'protobufjs']
  }
});
