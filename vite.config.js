
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

process.env.VITE_VERSION = '1.9'

export default defineConfig({
    plugins: [
        vue(),
    ],
    server: {
        proxy: {
            '/ice-servers.json': 'http://localhost:8443',
            '/public-groups.json': 'http://localhost:8443',
            '/recordings/pyrite': 'http://localhost:8443',
            '/ws': {
                changeOrigin: false,
                target: 'http://localhost:8443/',
                ws: true,
            },
        },
    },

})
