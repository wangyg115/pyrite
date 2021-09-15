import {defineConfig} from 'vite'
import {fileURLToPath} from 'url'
import path from 'path'
import vue from '@vitejs/plugin-vue'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!process.env.VITE_VERSION) {
    process.env.VITE_VERSION = 'dev'
}

// eslint-disable-next-line no-console
console.log('Build version:', process.env.VITE_VERSION)

export default defineConfig({
    resolve: {
        alias: [
            {find: "@", replacement: path.resolve(__dirname, 'src')},
        ],
    },
    plugins: [
        vue(),
    ],
    server: {
        proxy: {
            '/api': 'http://localhost:3030',
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
