import {deleteRecording, loadRecordings, recordingPath} from '../lib/recording.js'

export default function(app) {

    app.get('/api/recordings/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        const recordings = await loadRecordings(groupId)
        res.end(JSON.stringify(recordings))
    })

    app.get('/api/recordings/:groupid/:recording', async function(req, res) {
        const groupId = req.params.groupid
        const recording = req.params.recording
        const recordingTarget = recordingPath(groupId, recording)
        res.sendFile(recordingTarget)
    })

    app.get('/api/recordings/:groupid/:recording/delete', async function(req, res) {
        const groupId = req.params.groupid
        const recording = req.params.recording

        const recordings = await deleteRecording(groupId, recording)
        res.end(JSON.stringify(recordings))
    })
}
