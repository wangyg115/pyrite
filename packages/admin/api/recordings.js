import {loadRecordings} from '../lib/recording.js'

export default function(app) {

    app.get('/api/recordings/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        const recordings = await loadRecordings(groupId)
        res.end(JSON.stringify(recordings))
    })
}
