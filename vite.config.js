export default {
    proxy: {
        '/ice-servers.json': 'http://localhost:8443',
        '/ws': {
            changeOrigin: false,
            target: 'http://localhost:8443/',
            ws: true,
        },
    },
}
