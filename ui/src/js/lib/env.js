const ua = navigator.userAgent.toLowerCase()
const env = {
    browserName: 'Browser',
    isFirefox: false,
    isSafari: false,
}

if (globalThis.navigator) { env.isBrowser = true }
if (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0) {
    env.isSafari = true
    env.browserName = 'Safari'
}
if (ua.includes('firefox')) {
    env.isFirefox = ua.includes('firefox')
    env.browserName = 'Firefox'
}

export default env
