import {loadGroups} from '../lib/group.js'
import {loadUser, loadUsers} from '../lib/user.js'

export default function(app) {

    app.get('/api/context', async function(req, res) {
        const session=req.session

        if (session.userid) {
            const user = await loadUser(session.userid)
            if (!user) res.end(JSON.stringify({authenticated: false}))
            else {
                if (user.admin) {
                    const [{groupsData}, users] = await Promise.all([loadGroups(), loadUsers()])
                    res.end(JSON.stringify({authenticated: true, groups: groupsData, users}))
                } else {
                    res.end(JSON.stringify({authenticated: false}))
                }
            }

        } else {
            res.end(JSON.stringify({authenticated: false}))
        }
    })

    app.post('/api/login', async function(req, res) {
        const users = await loadUsers()
        const username = req.body.username
        const user = users.find((i) => i.name === username)

        if (!user) {
            res.end(JSON.stringify({authenticated: false}))
        } else {
            const password = req.body.password
            if (password === user.password) {
                const session = req.session
                session.userid = user.id
                res.end(JSON.stringify({authenticated: true}))
            } else {
                res.end(JSON.stringify({authenticated: false}))
            }
        }
    })

    app.get('/api/logout',(req, res) => {
        req.session.destroy()
        res.end(JSON.stringify({status: 'ok'}))
    })
}

