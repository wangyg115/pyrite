import {authContext, noAuthContext, noPermissionContext} from '../lib/profile.js'
import {loadUser, loadUsers} from '../lib/user.js'

export default function(app) {

    app.get('/api/context', async function(req, res) {
        const session=req.session
        let context

        if (process.env.PYRITE_NO_SECURITY) {
            app.logger.warn('session security is disabled (PYRITE_NO_SECURITY)')
            context = await authContext()
            return res.end(JSON.stringify(context))
        }

        if (session.userid) {
            const user = await loadUser(session.userid)
            if (!user || !user.admin) {
                context = noAuthContext()
            } else {
                context = await authContext()
            }
        } else {
            context = noAuthContext()
        }
        res.end(JSON.stringify(context))
    })

    app.post('/api/login', async function(req, res) {
        const users = await loadUsers()
        const username = req.body.username
        const user = users.find((i) => i.name === username)
        let context

        if (!user) {
            context = noAuthContext()
            res.end(JSON.stringify(context))
        } else {
            const password = req.body.password

            if (password === user.password) {
                if (user.admin) {
                    const session = req.session
                    session.userid = user.id
                    context = await authContext()
                } else {
                    context = noPermissionContext()
                }
            } else {
                context = noAuthContext()
            }
        }
        res.end(JSON.stringify(context))
    })

    app.get('/api/logout',async(req, res) => {
        req.session.destroy()
        const context = noAuthContext()
        res.end(JSON.stringify(context))
    })
}

