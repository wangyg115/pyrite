export default {
    proxy: {
        '/public-groups.json': 'http://localhost:8443',
        '/ice-servers.json': 'http://localhost:8443',
        '/ws': {
            changeOrigin: false,
            target: 'http://localhost:8443/',
            ws: true,
        },
    },
}
