import fs from 'fs-extra'
import path from 'path'

export default function(app) {
    /**
     * Retrieve a list of all users.
     */
    app.get('/api/users', async function(req, res) {
        const targetFile = path.join(app.settings.paths.data, 'users.json')
        const userData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
        res.end(JSON.stringify(userData))
    })

    /**
     * List all users.
     */
    app.post('/api/users', async function(req, res) {
        const targetFile = path.join(app.settings.paths.data, 'users.json')
        const userData = JSON.stringify(req.body)
        await fs.promises.writeFile(targetFile, userData)
        res.end(JSON.stringify({status: 'ok'}))
    })

}
