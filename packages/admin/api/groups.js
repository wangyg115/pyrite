import fetch from 'node-fetch'
import fs from 'fs-extra'
import {globby} from 'globby'
import {groupTemplate, saveGroup} from '../lib/group.js'
import path from 'path'

export default function(app) {
    /**
     * Read all groups.
     */
    app.get('/api/groups', async function(req, res) {

        const files = await globby(path.join(app.settings.paths.groups, '**'))

        const fileData = await Promise.all(files.map((i) => fs.promises.readFile(i, 'utf8')))
        const groupNames = files.map((i) => {
            return i.replace(app.settings.paths.groups, '').replace('.json', '').replace('/', '')
        })
        const groupData = []
        for (const [index, groupName] of groupNames.entries()) {
            const data = JSON.parse(fileData[index])
            data._name = groupName
            groupData.push(data)
        }
        // Keep Galene in sync with the group data.
        await Promise.all(groupNames.map((i) => fetch(`${app.settings.endpoints.galene}/group/${i}`)))
        res.end(JSON.stringify(groupData))
    })

    app.get('/api/groups/template', async function(req, res) {
        res.end(JSON.stringify(groupTemplate()))
    })

    /**
     * Read data from an existing group or from a template
     * in case of a non-existing group.
     */
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
            groupData._new = true
        }

        res.end(JSON.stringify(groupData))
    })

    /**
     * Create a new or update an existing group.
     */
    app.post('/api/groups/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        const groupData = req.body
        await saveGroup(groupId, groupData)
        res.end(JSON.stringify({status: 'ok'}))
    })

    /**
     * Delete an existing group.
     */
    app.get('/manager/groups/:groupid/delete', async function(req, res) {
        const groupId = req.params.groupid
        const groupFile = path.join(app.settings.paths.groups, `${groupId}.json`)
        app.logger.info(`removing group file ${groupFile}`)
        await fs.remove(groupFile)
        await fetch(`${app.settings.endpoints}/group/${groupId}`)
        res.end(JSON.stringify({status: 'ok'}))
    })

}
