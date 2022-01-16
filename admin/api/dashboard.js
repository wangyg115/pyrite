import app from '../app.js'

import {loadStats} from '../lib/dashboard.js'

export default function(app) {

    app.get('/api/dashboard/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        const stats = await loadStats(groupId)
        res.end(JSON.stringify(stats))
    })
}
