
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
    ],
    server: {
        proxy: {
            '/public-groups.json': 'http://localhost:8443',
            '/ice-servers.json': 'http://localhost:8443',
            '/ws': {
                changeOrigin: false,
                target: 'http://localhost:8443/',
                ws: true,
            },
        },
    },

})
