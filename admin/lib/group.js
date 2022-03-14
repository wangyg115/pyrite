import app from '../app.js'

import {dictionary} from './utils.js'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import {globby} from 'globby'
import path from 'path'
import {uniqueNamesGenerator} from 'unique-names-generator'
import {loadUsers, saveUsers} from './user.js'

const ROLES = ['op', 'other', 'presenter']

// Public group data Exposed on /api/groups/public
const PUBLIC_GROUP_FIELDS = [
    'allow-anonymous',
    'allow-recording',
    'allow-subgroups',
    'autokick',
    'autolock',
    'codecs',
    'comment',
    'contact',
    'description',
    'displayName',
    'max-clients',
    'max-history-age',
]

export function groupTemplate(groupId = null) {
    const template = {
        _name: groupId ? groupId : uniqueNamesGenerator({
            dictionaries: [dictionary.adjs, dictionary.nouns],
            length: 2,
            separator: '-',
            style: 'lowercase',
        }),
        _permissions: {},
        _unsaved: true,
        'allow-anonymous': false,
        'allow-recording': true,
        'allow-subgroups': true,
        autokick: false,
        autolock: false,
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

    template._newName = template._name
    return template
}

export async function loadGroupPermissions(groupName) {
    const permissions = {op: [], other: [], presenter: []}
    // Permissions from a group perspective; transformed from users.json
    const users = await loadUsers()
    for (const user of users) {
        for (const permissionName of Object.keys(user.groups)) {
            for (const _groupName of user.groups[permissionName]) {
                if (groupName === _groupName) {
                    permissions[permissionName].push(user.name)
                }
            }
        }
    }
    return permissions
}

export async function saveGroupPermissions(groupName, groupPermissions) {
    // Save the group permissions to users.json and
    // sync back to the group files afterwards.
    const users = await loadUsers()
    for (const permissionName of Object.keys(groupPermissions)) {

        for (const user of users) {
            let userGroupMatch = false
            for (const username of groupPermissions[permissionName]) {
                if (user.name === username) {
                    userGroupMatch = true
                    if (!user.groups[permissionName].includes(groupName)) {
                        user.groups[permissionName].push(groupName)
                    }
                }
            }

            if (!userGroupMatch) {
                if (user.groups[permissionName].includes(groupName)) {
                    user.groups[permissionName].splice(user.groups[permissionName].indexOf(groupName), 1)
                }
            }
        }
    }

    await saveUsers(users)
}

export async function loadGroup(groupName) {
    app.logger.debug(`load group ${groupName}`)
    const groupFile = path.join(app.config.sfu.path.groups, `${groupName}.json`)
    const exists = await fs.pathExists(groupFile)
    if (!exists) return null
    const groupData = JSON.parse(await fs.promises.readFile(groupFile, 'utf8'))
    groupData._permissions = await loadGroupPermissions(groupName)
    groupData._name = groupName
    groupData._newName = groupName
    groupData._delete = false
    groupData._unsaved = false
    return groupData
}

export async function loadGroups(publicEndpoint = false) {
    app.logger.debug(`load groups`)
    // Contains clientCount; mix it with the Pyrite group info.
    let galeneGroups = await (await fetch(`${app.settings.sfu.url}/public-groups.json`)).json()
    const files = await globby(path.join(app.config.sfu.path.groups, '**', '*.json'))
    const fileData = await Promise.all(files.map((i) => fs.promises.readFile(i, 'utf8')))
    const groupNames = files.map((i) => {
        return i.replace(app.config.sfu.path.groups, '').replace('.json', '').replace('/', '')
    })

    const groupsData = []
    for (const [index, groupName] of groupNames.entries()) {
        const groupData = JSON.parse(fileData[index])
        let data = {}

        if (publicEndpoint) {
            // name, description, clientCount
            for (const [key, value] of Object.entries(groupData)) {
                if (key === 'public' && value === false) {
                    continue
                }

                if (PUBLIC_GROUP_FIELDS.includes(key)) {
                    data[key] = value
                }
            }
        } else {
            data = groupData
            data._permissions = await loadGroupPermissions(groupName)
            data._name = groupName
            data._newName = groupName
            data._delete = false
            data._unsaved = false
        }

        const galeneGroup = galeneGroups.find((i) => i.name === groupName)
        if (galeneGroup) {
            Object.assign(data, {
                clientCount: galeneGroup.clientCount,
                name: groupName,
            })
        }

        groupsData.push(data)

    }

    return {groupNames, groupsData}
}

export async function pingGroups(groupNames) {
    app.logger.debug(`ping groups: ${groupNames}`)
    await Promise.all(groupNames.map((i) => fetch(`${app.settings.sfu.url}/group/${i}`)))
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

export async function saveGroup(groupName, data) {
    const saveData = JSON.parse(JSON.stringify(data))
    // Remove non-group data.
    delete saveData.name
    delete saveData.clientCount

    await saveGroupPermissions(groupName, saveData._permissions)

    // All actions not directly related to the Galene file format
    // should go before removing the private variables.
    for (const key of Object.keys(saveData)) {
        if (key.startsWith('_')) delete saveData[key]
    }

    const currentGroupFile = path.join(app.config.sfu.path.groups, `${data._name}.json`)
    if (data._name !== data._newName) {
        app.logger.debug(`save and rename group ${groupName}`)
        const newGroupFile = path.join(app.config.sfu.path.groups, `${data._newName}.json`)
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

