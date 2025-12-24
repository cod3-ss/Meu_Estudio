import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Porta para o ambiente de desenvolvimento
  },
  build: {
    outDir: 'dist',
  },
  // A seção de preview pode ser removida ou simplificada se não for usada localmente
  // Nginx cuidará do serviço da build em produção na porta 80
});
