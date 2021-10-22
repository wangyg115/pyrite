/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
export function mergeDeep(target, ...sources) {
    if (!sources.length) return target
    const source = sources.shift()

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}})
                mergeDeep(target[key], source[key])
            } else {
                Object.assign(target, {[key]: source[key]})
            }
        }
    }

    return mergeDeep(target, ...sources)
}

export function nameGenerator(){
    var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
            "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
            "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
            "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
            "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
            "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
            "wandering", "withered", "wild", "black", "young", "holy", "solitary",
            "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
            "polished", "ancient", "purple", "lively", "nameless"]

        , nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
            "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
            "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
            "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
            "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
            "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
            "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
            "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
            "frog", "smoke", "star"]

    return adjs[Math.floor(Math.random()*(adjs.length-1))]+"-"+nouns[Math.floor(Math.random()*(nouns.length-1))]
}
