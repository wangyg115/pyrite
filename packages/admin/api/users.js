import fs from 'fs-extra'
import path from 'path'
import {loadGroup, saveGroup} from '../lib/group.js'

export default function(app) {
    const targetFile = path.join(app.settings.paths.data, 'users.json')
    /**
     * Read all users.
     */
    app.get('/api/users', async function(req, res) {
        const userData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
        res.end(JSON.stringify(userData))
    })

    /**
     * Read an existing user.
     */
    app.get('/api/users/:userid', async function(req, res) {
        const userId = req.params.userid
        // Basic path traversal protection
        if (userId.match(/\.\.\//g) !== null) {
            res.end(JSON.stringify({error: 'invalid user id'}))
            return
        }

        const userData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
        const user = userData.find((i) => i.id === parseInt(userId))
        res.end(JSON.stringify(user))
    })

    /**
     * Create a new or update an existing user.
     */
    app.post('/api/users/:userid', async function(req, res) {
        const userId = parseInt(req.params.userid)
        // TODO: Schema validation
        const postedData = req.body
        let targetUser

        let userData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))

        for (let [index, user] of userData.entries()) {
            if (user.id === userId) {
                userData[index] = postedData
                targetUser = userData[index]
            }
        }

        await fs.promises.writeFile(targetFile, JSON.stringify(userData))
        /**
         * To keep users.json groups in sync with the users in each group file:
         * - The user's permission group in users.json is not in the appropriate groups file yet => add to Galene group
         * - The user's permission group is in the group file, but not in users.json => delete from Galene group
         */
        // Update all groups that the user in users.json is a member of.

        // Start from the perspective of user groups (step 1)
        for (const [permissionGroup, userGroups] of Object.entries(targetUser.groups)) {

            for (const groupName of userGroups) {
                const galeneGroup = await loadGroup(groupName)
                const galeneUserEntryIndex = galeneGroup[permissionGroup].findIndex((g) => g.username === targetUser.name)
                if (galeneUserEntryIndex >= 0) {
                    app.logger.info(`updating ${targetUser.name} in group ${groupName}`)
                    // E.g. Update password.
                    galeneGroup[permissionGroup][galeneUserEntryIndex] = {password: targetUser.password, username: targetUser.name}
                } else {
                    app.logger.info(`adding ${targetUser.name} to group ${groupName}`)
                    galeneGroup[permissionGroup].push({password: targetUser.password, username: targetUser.name})
                }

                await saveGroup(groupName, galeneGroup)
            }

        }

        res.end(JSON.stringify({status: 'ok'}))
    })

    /**
     * Delete an existing user.
     */
    app.get('/manager/users/:userid/delete', async function(req, res) {
        const userId = req.params.userid

        const userData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
        for (let [index, user] of userData.entries()) {
            if (user.name === userId) {
                userData.splice(index, 1)
            }
        }

        await fs.promises.writeFile(targetFile, JSON.stringify(userData))
        res.end(JSON.stringify({status: 'ok'}))
    })

}
