import {defineConfig} from 'vite'
import semanticRelease from 'semantic-release'
import vue from '@vitejs/plugin-vue'

if (process.env.NODE_ENV === 'production') {
    semanticRelease({
        dryRun: true,
        repositoryUrl: 'https://github.com/garage44/pyrite.git',
    }).then(() => {

    })
} else {
    process.env.VITE_VERSION = 'dev'
}

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
