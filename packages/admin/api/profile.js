import fs from 'fs-extra'
import path from 'path'

export default function(app) {
    /**
     * Retrieve the current user's manager context.
     */
    app.get('/api/context', async function(req, res) {
        const session=req.session
        if (session.userid ) {
            res.end(JSON.stringify({authenticated: true}))
        } else {
            res.end(JSON.stringify({authenticated: true}))
        }
    })

    /**
     * Login as manager with the credentials from data/passwd.
     */
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

    /**
     * Log the manager out.
     */
    app.get('/api/logout',(req, res) => {
        req.session.destroy()
    })
}

