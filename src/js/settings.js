export default class Settings {
    /**
     * This always returns a dictionary.
     *
     * @returns {settings}
     */
    getSettings() {
        /** @type {settings} */
        let settings
        try {
            let json = window.sessionStorage.getItem('settings')
            settings = JSON.parse(json)
        } catch(e) {
            console.warn("Couldn't retrieve password:", e)
            settings = fallbackSettings
        }
        return settings || {}
    }


    /**
     * @param {settings} settings
     */
    storeSettings(settings) {
        try {
            window.sessionStorage.setItem('settings', JSON.stringify(settings))
            fallbackSettings = null
        } catch(e) {
            console.warn("Couldn't store password:", e)
            fallbackSettings = settings
        }
    }


    /**
     * @param {string} key
     * @param {any} value
     */
    updateSetting(key, value) {
        let s = {}
        s[key] = value
        updateSettings(s)
    }


    /**
     * @param {settings} settings
     */
    updateSettings(settings) {
        let s = getSettings()
        for(let key in settings)
            s[key] = settings[key]
        storeSettings(s)
    }
}



