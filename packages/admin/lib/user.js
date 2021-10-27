import fs from 'fs-extra'
import path from 'path'
import {loadGroup, saveGroup} from './group.js'

export const userTemplate = [
    {
        admin:false,
        groups:{
            op: [],
            other: [],
            presenter: [],
        },
        id: 1,
        name:"alice",
        password: "alice",
    },
    {
        admin: true,
        groups: {
            op:[],
            other:[],
            presenter:[],
        },
        id: 2,
        name: "pyrite",
        password: "pyrite",
    },
]

export async function saveUser(userId, userData) {
    const targetFile = path.join(app.settings.paths.data, 'users.json')
    let usersData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
    let targetUser

    for (let [index, user] of usersData.entries()) {
        if (user.id === userId) {
            usersData[index] = userData
            targetUser = usersData[index]
        }
    }

    await fs.promises.writeFile(targetFile, JSON.stringify(usersData))
    return targetUser
}

/**
 * To keep users.json groups in sync with the users in each group file:
 * - The user's permission group in users.json is not in the appropriate groups file yet => add to Galene group
 * - The user's permission group is in the group file, but not in users.json => delete from Galene group\
 * - The user's permission group is in the user definition, but the group doesn't exist.
 */
export async function syncUserGroups(targetUser) {
    const invalidRoleGroups = {
        op: [],
        other: [],
        presenter: [],
    }
    for (const [roleName, roleGroups] of Object.entries(targetUser.groups)) {

        for (const [groupIndex, groupName] of roleGroups.entries()) {
            const galeneGroup = await loadGroup(groupName)
            if (!galeneGroup) {
                invalidRoleGroups[roleName].push(groupName)
                app.logger.debug(`add to invalid groups: ${groupName}`)
                continue
            }
            const galeneUserEntryIndex = galeneGroup[roleName].findIndex((g) => g.username === targetUser.name)
            if (galeneUserEntryIndex >= 0) {
                app.logger.info(`updating ${targetUser.name} in group ${groupName}`)
                galeneGroup[roleName][galeneUserEntryIndex] = {password: targetUser.password, username: targetUser.name}
            } else {
                app.logger.info(`adding ${targetUser.name} to group ${groupName}`)
                galeneGroup[roleName].push({password: targetUser.password, username: targetUser.name})
            }

            await saveGroup(groupName, galeneGroup)
        }
    }

    for (const [roleName, invalidGroups] of Object.entries(invalidRoleGroups)) {
        targetUser.groups[roleName] = targetUser.groups[roleName].filter((i) => !invalidGroups.includes(i))
    }

    const user = await saveUser(targetUser.id, targetUser)
    return user
}
