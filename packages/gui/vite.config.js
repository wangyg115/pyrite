import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

if (!process.env.VITE_VERSION) {
    process.env.VITE_VERSION = 'dev'
}

// eslint-disable-next-line no-console
console.log('Build version:', process.env.VITE_VERSION)

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
