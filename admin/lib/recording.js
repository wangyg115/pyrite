import app from '../app.js'
import fs from 'fs-extra'
// import {globby} from 'globby'
import path from 'path'
import {globbyWin} from './utils.js'

export async function loadRecordings(groupId) {
    app.logger.debug(`load recordings from group: ${groupId}`)
    const files = await globbyWin(path.join(app.config.sfu.path.recordings, groupId, '*.webm'))
    const fileStats = await Promise.all(files.map((i) => fs.stat(i, 'utf8')))
    const fileNames = files.map((i) => {
        return i.replace(path.join(app.config.sfu.path.recordings, groupId), '').replace('.webm', '').replace(path.sep, '')
    })

    const filesData = []
    for (const [index, filename] of fileNames.entries()) {
        const data = {
            atime: fileStats[index].atime,
            extension: 'webm',
            filename,
            size: fileStats[index].size,
        }
        filesData.push(data)
    }

    return filesData
}

export function recordingPath(groupId, recording) {
    const dirname = path.join(app.config.sfu.path.recordings, groupId)
    // Sanitize against directory traversal?
    return path.join(dirname, recording).replaceAll(path.sep, '/')
}

export async function deleteRecording(groupId, recording) {
    const recordingTarget = recordingPath(groupId, recording)
    await fs.remove(recordingTarget)
    const recordings = await loadRecordings(groupId)
    return recordings
}
