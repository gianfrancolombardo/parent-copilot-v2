import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables from both .env files and system env vars
    const env = loadEnv(mode, '.', '');
    
    // For production builds, prioritize system env vars (Netlify) over .env file
    const systemEnv = {
        // Use system env vars first (for Netlify), then fall back to .env file
        REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY,
        REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID,
        REACT_APP_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID,
        REACT_APP_OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || env.REACT_APP_OPENAI_API_KEY,
        API_KEY: process.env.API_KEY || env.API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || env.GEMINI_API_KEY,
    };
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/openai': {
            target: 'https://api.openai.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/openai/, ''),
            configure: (proxy, _options) => {
              proxy.on('error', (err, _req, _res) => {
                console.log('proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                console.log('Sending Request to the Target:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              });
            },
          }
        }
      },
      plugins: [react()],
      define: {
        // Use import.meta.env for Vite (more reliable than process.env)
        'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(systemEnv.REACT_APP_FIREBASE_API_KEY),
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(systemEnv.REACT_APP_FIREBASE_AUTH_DOMAIN),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(systemEnv.REACT_APP_FIREBASE_PROJECT_ID),
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(systemEnv.REACT_APP_FIREBASE_STORAGE_BUCKET),
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(systemEnv.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
        'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(systemEnv.REACT_APP_FIREBASE_APP_ID),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(systemEnv.REACT_APP_OPENAI_API_KEY),
        'import.meta.env.VITE_API_KEY': JSON.stringify(systemEnv.API_KEY),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(systemEnv.GEMINI_API_KEY),
        
        // Keep process.env for backward compatibility
        'process.env.API_KEY': JSON.stringify(systemEnv.API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(systemEnv.GEMINI_API_KEY),
        'process.env.REACT_APP_OPENAI_API_KEY': JSON.stringify(systemEnv.REACT_APP_OPENAI_API_KEY),
        'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(systemEnv.REACT_APP_FIREBASE_API_KEY),
        'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(systemEnv.REACT_APP_FIREBASE_AUTH_DOMAIN),
        'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(systemEnv.REACT_APP_FIREBASE_PROJECT_ID),
        'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(systemEnv.REACT_APP_FIREBASE_STORAGE_BUCKET),
        'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(systemEnv.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(systemEnv.REACT_APP_FIREBASE_APP_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
