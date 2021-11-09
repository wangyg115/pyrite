import {authContext, noAuthContext} from '../lib/profile.js'
import {loadUser, loadUsers} from '../lib/user.js'

export default function(app) {

    app.get('/api/context', async function(req, res) {
        const session=req.session
        let context

        if (process.env.PYRITE_NO_SECURITY) {
            app.logger.warn('session security is disabled (PYRITE_NO_SECURITY)')
            context = await authContext()
        } else if (session.userid) {
            const user = await loadUser(session.userid)
            if (!user) {
                context = await noAuthContext()
            } else {
                if (user.admin) {
                    context = await authContext()
                } else {
                    context = await noAuthContext()
                }
            }
        } else {
            context = await authContext()
        }
        res.end(JSON.stringify(context))
    })

    app.post('/api/login', async function(req, res) {
        const users = await loadUsers()
        const username = req.body.username
        const user = users.find((i) => i.name === username)
        let context

        if (!user) {
            context = await noAuthContext()
            res.end(JSON.stringify(context))
        } else {
            const password = req.body.password
            if (password === user.password) {
                const session = req.session
                session.userid = user.id
                context = await authContext()

            } else {
                context = await noAuthContext()
            }
        }
        res.end(JSON.stringify(context))
    })

    app.get('/api/logout',(req, res) => {
        req.session.destroy()
        res.end(JSON.stringify({status: 'ok'}))
    })
}

