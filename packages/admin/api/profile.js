import fs from 'fs-extra'
import {loadGroups} from '../lib/group.js'
import {loadUsers} from '../lib/user.js'
import path from 'path'

export default function(app) {

    app.get('/api/context', async function(req, res) {
        const session=req.session
        const [_, groups] = await loadGroups()
        const users = await loadUsers()
        if (session.userid) {
            res.end(JSON.stringify({authenticated: true, groups, users}))
        } else {
            res.end(JSON.stringify({authenticated: true, groups, users}))
        }
    })

    app.post('/api/login', async function(req, res) {
        const targetFile = path.join(app.settings.paths.data, 'passwd')
        let [username, password] = (await fs.promises.readFile(targetFile, 'utf8')).trim().split(':')
        if (req.body.username === username && req.body.password === password) {
            const session = req.session
            session.userid = username
            res.end(JSON.stringify({authenticated: true}))
        } else {
            res.end(JSON.stringify({authenticated: false}))
        }
    })

    app.get('/api/logout',(req, res) => {
        req.session.destroy()
        res.end(JSON.stringify({status: 'ok'}))
    })
}

