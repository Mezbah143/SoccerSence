import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins:[react()],
  // Never bind the dev proxy to a LAN/public interface. Do not use this in
  // deployed production: Vite dev server remains local to the developer.
  server:{
    host:'127.0.0.1',
    strictPort:true,
    proxy:{
      // Development-only fixed artwork lookup. Never turn into an arbitrary URL proxy.
      '/sportsdb-preview':{
        target:'https://www.thesportsdb.com',
        changeOrigin:true,
        secure:true,
        rewrite:()=>'/api/v1/json/123/searchteams.php?t=Arsenal',
      },
      '/api':{
        target:'http://127.0.0.1:8787',
        changeOrigin:true,
        configure(proxy){
          proxy.on('proxyReq', request=>{
            // Requests already came through loopback-only Vite. Strip browser
            // Origin before the server-to-server hop so the gateway's exact
            // loopback host/origin policy stays intact.
            request.removeHeader('origin')
          })
        },
      },
    },
  },
})
