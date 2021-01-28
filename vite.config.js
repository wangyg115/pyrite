
import { defineConfig } from 'vite'
import pyritePackage from './package.json'
import vue from '@vitejs/plugin-vue'

process.env.VITE_VERSION = pyritePackage.version

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
