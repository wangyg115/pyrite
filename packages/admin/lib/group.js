import fs from 'fs-extra'
import {globby} from 'globby'
import path from 'path'

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

export async function loadGroup(groupName) {
    const groupFile = path.join(app.settings.paths.groups, `${groupName}.json`)
    const groupData = JSON.parse(await fs.promises.readFile(groupFile, 'utf8'))
    return groupData
}

export async function loadGroups() {
    const files = await globby(path.join(app.settings.paths.groups, '**', '*.json'))
    const fileData = await Promise.all(files.map((i) => fs.promises.readFile(i, 'utf8')))
    const groupNames = files.map((i) => {
        return i.replace(app.settings.paths.groups, '').replace('.json', '').replace('/', '')
    })

    const groupFile = path.join(app.settings.paths.groups, `${groupName}.json`)
    const groupData = JSON.parse(await fs.promises.readFile(groupFile, 'utf8'))
    return groupData
}

export async function pingGroups(groupNames) {
    await Promise.all(groupNames.map((i) => fetch(`${app.settings.endpoints.galene}/group/${i}`)))
}

export async function saveGroup(groupName, data) {
    const groupFile = path.join(app.settings.paths.groups, `${groupName}.json`)
    for (const key of Object.keys(data)) {
        if (key.startsWith('_')) delete data[key]
    }
    await fs.promises.writeFile(groupFile, JSON.stringify(data, null, '  '))
}

export function groupTemplate(groupId = null) {
    return {
        _name: groupId ? groupId : nameGenerator(),
        'allow-anonymous': false,
        'allow-recording': true,
        'allow-subgroups': true,
        autokick: false,
        autolock: true,
        codecs: ['opus', 'vp8'],
        comment: '',
        contact: '',
        description: '',
        displayName: '',
        'max-clients': 10,
        'max-history-age': 14400,
        op: [],
        other: [],
        presenter: [],
        public: true,
        redirect: '',
    }
}
