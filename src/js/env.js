function isSafari() {
    let ua = navigator.userAgent.toLowerCase()
    return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0
}

const env = {}
env.isSafari = isSafari()


export default env