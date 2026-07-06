import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const manualChunks = (id: string): string | undefined => {
  if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
    return 'vendor-react';
  }
  if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/zustand')) {
    return 'vendor-data';
  }
  if (id.includes('node_modules/axios')) {
    return 'vendor-net';
  }
};

export default defineConfig(({ mode }) => {
  // loadEnv reads ALL env vars (not just VITE_* prefixed) so HTTP_PORT is available
  const env = loadEnv(mode, process.cwd(), '');

  // Build proxy target: prefer VITE_API_PROXY_TARGET, fall back to localhost:80
  const proxyBase = (env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1').replace(/\/$/, '');
  const port      = env.HTTP_PORT ? Number(env.HTTP_PORT) : 80;
  // Only append port when it isn't the scheme default (80 for http, 443 for https)
  const isHttp    = proxyBase.startsWith('http://');
  const isHttps   = proxyBase.startsWith('https://');
  const isDefault = (isHttp && port === 80) || (isHttps && port === 443);
  const proxyTarget = isDefault ? proxyBase : `${proxyBase}:${port}`;

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: { manualChunks },
      },
    },
    server: {
      proxy: {
        '/api': {
          target:       proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
