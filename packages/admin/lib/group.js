import fetch from 'node-fetch'
import fs from 'fs-extra'
import {globby} from 'globby'
import {nameGenerator} from './utils.js'
import path from 'path'

export function groupTemplate(groupId = null) {
    return {
        _name: groupId ? groupId : nameGenerator(),
        _unsaved: true,
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

    const groupData = []
    for (const [index, groupName] of groupNames.entries()) {
        const data = JSON.parse(fileData[index])
        data._name = groupName
        groupData.push(data)
    }

    return [groupNames, groupData]
}

export async function pingGroups(groupNames) {
    await Promise.all(groupNames.map((i) => fetch(`${app.settings.endpoints.galene}/group/${i}`)))
}

export async function saveGroup(groupName, data) {
    const groupFile = path.join(app.settings.paths.groups, `${groupName}.json`)
    const saveData = JSON.parse(JSON.stringify(data))
    for (const key of Object.keys(saveData)) {
        if (key.startsWith('_')) delete saveData[key]
    }
    await fs.promises.writeFile(groupFile, JSON.stringify(saveData, null, '  '))
    // This group is saved; remove the unsaved flag.
    delete data._unsaved
    return data
}

