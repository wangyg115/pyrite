import {loadUser, loadUsers, saveUser, saveUsers, syncUsers, userTemplate} from '../lib/user.js'

export default function(app) {

    app.get('/api/users', async function(req, res) {
        const users = await loadUsers()
        res.end(JSON.stringify(users))
    })

    app.get('/api/users/template', async function(req, res) {
        res.end(JSON.stringify(userTemplate()))
    })

    app.get('/api/users/:userid', async function(req, res) {
        const userId = req.params.userid
        let user
        // Basic path traversal protection
        if (userId.match(/\.\.\//g) !== null) {
            res.end(JSON.stringify({error: 'invalid user id'}))
            return
        }

        const users = await loadUsers()
        user = users.find((i) => i.id === userId)
        // User doesn't exist yet; generate a user.
        if (!user) {
            res.status(404).send({error: 'user not found'})
            return
        }
        res.end(JSON.stringify(user))
    })

    app.post('/api/users/:userid', async function(req, res) {
        const userId = req.params.userid
        // TODO: Schema validation
        const userData = req.body
        await saveUser(userId, userData)
        await syncUsers()
        const user = await loadUser(userId)
        res.end(JSON.stringify(user))
    })

    app.get('/api/users/:userid/delete', async function(req, res) {
        const userId = req.params.userid
        const users = await loadUsers()
        for (let [index, user] of users.entries()) {
            if (user.id === userId) {
                users.splice(index, 1)
            }
        }

        await saveUsers(users)
        await syncUsers()

        res.end(JSON.stringify({status: 'ok'}))
    })

}
