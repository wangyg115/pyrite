import {dictionary} from './utils.js'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import {globby} from 'globby'
import path from 'path'
import {uniqueNamesGenerator} from 'unique-names-generator'
import {loadUsers, saveUsers} from './user.js'

const ROLES = ['op', 'other', 'presenter']

export function groupTemplate(groupId = null) {
    return {
        _name: groupId ? groupId : uniqueNamesGenerator({
            dictionaries: [dictionary.adjs, dictionary.nouns],
            length: 2,
            separator: '-',
            style: 'lowercase',
        }),
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
    app.logger.debug(`load group ${groupName}`)
    const groupFile = path.join(app.settings.paths.groups, `${groupName}.json`)
    const exists = await fs.pathExists(groupFile)
    if (!exists) return null
    const groupData = JSON.parse(await fs.promises.readFile(groupFile, 'utf8'))
    groupData._name = groupName
    groupData._newName = groupName
    groupData._delete = false
    groupData._unsaved = false
    return groupData
}

export async function loadGroups() {
    app.logger.debug(`load groups`)
    const files = await globby(path.join(app.settings.paths.groups, '**', '*.json'))
    const fileData = await Promise.all(files.map((i) => fs.promises.readFile(i, 'utf8')))
    const groupNames = files.map((i) => {
        return i.replace(app.settings.paths.groups, '').replace('.json', '').replace('/', '')
    })

    const groupsData = []
    for (const [index, groupName] of groupNames.entries()) {
        const data = JSON.parse(fileData[index])
        data._name = groupName
        data._newName = groupName
        data._delete = false
        data._unsaved = false
        groupsData.push(data)
    }

    return {groupNames, groupsData}
}

export async function pingGroups(groupNames) {
    app.logger.debug(`ping groups: ${groupNames}`)
    await Promise.all(groupNames.map((i) => fetch(`${app.settings.endpoints.galene}/group/${i}`)))
}

export async function saveGroup(groupName, data) {
    const saveData = JSON.parse(JSON.stringify(data))

    for (const key of Object.keys(saveData)) {
        if (key.startsWith('_')) delete saveData[key]
    }

    const currentGroupFile = path.join(app.settings.paths.groups, `${data._name}.json`)
    if (data._name !== data._newName) {
        app.logger.debug(`save and rename group ${groupName}`)
        const newGroupFile = path.join(app.settings.paths.groups, `${data._newName}.json`)
        // Sync current group file in group definitions and users.json
        await renameGroup(data._name, data._newName)
        await fs.remove(currentGroupFile)

        await fs.promises.writeFile(newGroupFile, JSON.stringify(saveData, null, '  '))
        return {data, groupId: data._newName}
    } else {
        app.logger.debug(`save group ${groupName}`)
        await fs.promises.writeFile(currentGroupFile, JSON.stringify(saveData, null, '  '))
        return {data, groupId: data._name}
    }
}

export async function renameGroup(oldGroupName, newGroupName) {
    const users = await loadUsers()
    for (const user of users) {
        for (const role of Object.values(user.groups)) {
            for (const [roleIndex, groupName] of role.entries()) {
                if (groupName === oldGroupName) {
                    role[roleIndex] = newGroupName
                    app.logger.debug(`rename old user group ${oldGroupName} => ${newGroupName}`)
                }
            }
        }
    }

    await saveUsers(users)
}

/**
 * Updates users in users.json from a Galène group.
 */
export async function syncGroup(groupId, groupData) {
    app.logger.debug(`sync group ${groupId}`)
    const users = await loadUsers()
    let changed = false
    for (const role of ROLES) {
        for (const username of groupData[role]) {
            const _user = users.find((i) => i.name === username)
            // User from groups definition is in users.json;
            // Make sure the group is there as well...
            if (_user) {
                if (!_user.groups[role].includes(groupId)) {
                    app.logger.debug(`add group ${groupId} to users.json user ${_user.name}`)
                    _user.groups[role].push(groupId)
                    changed = true
                }
            }
        }
    }

    if (changed) await saveUsers(users)

}

