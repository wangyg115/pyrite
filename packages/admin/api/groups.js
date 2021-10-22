import fs from 'fs-extra'
import path from 'path'
import {groupTemplate, loadGroups, pingGroups, saveGroup} from '../lib/group.js'

export default function(app) {

    app.get('/api/groups', async function(req, res) {
        const [groupNames, groupData] = await loadGroups()
        await pingGroups(groupNames)
        res.end(JSON.stringify(groupData))
    })

    app.get('/api/groups/template', async function(req, res) {
        res.end(JSON.stringify(groupTemplate()))
    })

    app.get('/api/groups/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        let groupData
        // Basic path traversal protection
        if (groupId.match(/\.\.\//g) !== null) {
            res.end(JSON.stringify({error: 'invalid group id'}))
            return
        }

        const targetFile = path.join(app.settings.paths.groups, `${groupId}.json`)
        const exists = await fs.pathExists(targetFile)
        if (exists) {
            groupData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
            groupData._name = groupId
        } else {
            groupData = groupTemplate(groupId)
        }

        res.end(JSON.stringify(groupData))
    })

    app.post('/api/groups/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        const data = req.body
        const group = await saveGroup(groupId, data)
        res.end(JSON.stringify(group))
    })

    app.get('/api/groups/:groupid/delete', async function(req, res) {
        const groupId = req.params.groupid
        const groupFile = path.join(app.settings.paths.groups, `${groupId}.json`)
        app.logger.info(`removing group file ${groupFile}`)
        await fs.remove(groupFile)
        const [_, groups] = await loadGroups()
        await pingGroups([groupId])
        res.end(JSON.stringify(groups))
    })

}
