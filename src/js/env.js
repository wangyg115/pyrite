const ua = navigator.userAgent.toLowerCase()
const env = {}

if (globalThis.navigator) { env.isBrowser = true }
env.isSafari = ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0
env.isFirefox = ua.includes('firefox')

export default env
