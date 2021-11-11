import {promises as fs} from 'fs'
import {globby} from 'globby'
import path from 'path'

export async function loadRecordings(groupId) {
    app.logger.debug(`load recordings from group: ${groupId}`)
    const files = await globby(path.join(app.settings.paths.recordings, groupId, '*.webm'))
    const fileStats = await Promise.all(files.map((i) => fs.stat(i, 'utf8')))
    const fileNames = files.map((i) => {
        return i.replace(path.join(app.settings.paths.recordings, groupId), '').replace('.webm', '').replace('/', '')
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
