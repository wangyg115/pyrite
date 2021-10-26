import fs from 'fs-extra'
import path from 'path'
import {saveUser, syncUserGroups} from '../lib/user.js'

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
        let targetUser = await saveUser(userId, postedData)
        const user = await syncUserGroups(targetUser)
        res.end(JSON.stringify(user))
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
