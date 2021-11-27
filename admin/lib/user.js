import fs from 'fs-extra'
import path from 'path'
import {v4 as uuidv4} from 'uuid'
import {adjectives, animals, colors, NumberDictionary, uniqueNamesGenerator} from 'unique-names-generator'
import {loadGroups, saveGroup} from './group.js'

export function userTemplate(overrides) {
    const template = {
        _unsaved: true,
        admin: false,
        groups: {
            op: [],
            other: [],
            presenter: [],
        },
        id: uuidv4(),
        name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
            style: 'lowercase',
        }),
        password: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, NumberDictionary.generate({max: 9999, min: 1000})],
            separator: '-',
        }),
    }

    return {...template, ...overrides}
}

export async function loadUsers() {
    const targetFile = path.join(app.config.sfu.path.data, 'users.json')
    return JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
}

export async function loadUser(userId) {
    const users = await loadUsers()
    for (const user of users) {
        if (user.id === userId) return user
    }
    return null
}

export async function saveUser(userId, data) {
    const targetFile = path.join(app.config.sfu.path.data, 'users.json')
    let usersData

    const exists = await fs.pathExists(targetFile)
    if (exists) usersData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
    else usersData = []

    let existingUser = false

    for (let [index, user] of usersData.entries()) {
        if (user.id === userId) {
            usersData[index] = data
            existingUser = true
        }
    }

    if (!existingUser) {
        app.logger.debug(`save new user ${userId}`)
        usersData.push(data)
    } else {
        app.logger.debug(`updating existing user ${userId}`)
    }

    delete data._unsaved

    await fs.promises.writeFile(targetFile, JSON.stringify(usersData, null, '  '))
    return data
}

export async function saveUsers(data) {
    const targetFile = path.join(app.config.sfu.path.data, 'users.json')
    await fs.promises.writeFile(targetFile, JSON.stringify(data, null, '  '))
}

export async function syncUsers() {
    app.logger.info('syncing users...')
    const {groupNames, groupsData} = await loadGroups()

    // Contains per group the user's that are subscribed.
    const groupsUser = {}
    for (const groupName of groupNames) {
        groupsUser[groupName] = {op: [], other: [], presenter: []}
    }

    const users = await loadUsers()

    for (const user of users) {
        for (const [roleName, role] of Object.entries(user.groups)) {
            for (const [roleIndex, groupName] of role.entries()) {
                if (!groupNames.includes(groupName)) {
                    // Get rid of non-existing groups in users.json
                    app.logger.debug(`remove invalid group ${groupName} from user ${user.name}`)
                    role.splice(roleIndex, 1)
                } else {
                    if (!groupsUser[groupName][roleName].includes(user.name)) {
                        groupsUser[groupName][roleName].push({
                            password: user.password,
                            username: user.name,
                        })
                    }
                }
            }
        }
    }

    // Update users.json
    await saveUsers(users)
    // Update all Galene groups roles with the ones from users.json
    for (const group of groupsData) {
        Object.assign(group, groupsUser[group._name])
        await saveGroup(group._name, group)
    }
}
