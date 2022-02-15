import fs from 'fs-extra'
import path from 'path'
import {syncUsers} from '../lib/user.js'
import {groupTemplate, loadGroup, loadGroups, pingGroups, saveGroup, syncGroup} from '../lib/group.js'

export default function(app) {

    app.get('/api/groups', async function(req, res) {
        const {groupsData, groupNames} = await loadGroups()
        await pingGroups(groupNames)
        res.end(JSON.stringify(groupsData))
    })

    app.get('/api/groups/public', async function(req, res) {
        const {groupsData, groupNames} = await loadGroups({publicEndpoint: true})
        await pingGroups(groupNames)
        res.end(JSON.stringify(groupsData))
    })

    app.get('/api/groups/template', async function(req, res) {
        res.end(JSON.stringify(groupTemplate()))
    })

    app.get('/api/groups/:groupid', async function(req, res) {
        const groupId = req.params.groupid
        // Basic path traversal protection
        if (groupId.match(/\.\.\//g) !== null) {
            res.end(JSON.stringify({error: 'invalid group id'}))
            return
        }

        const groupData = await loadGroup(groupId)
        if (!groupData) {
            res.status(404).send({error: 'group not found'})
            return
        }

        res.end(JSON.stringify(groupData))
    })

    app.post('/api/groups/:groupid', async function(req, res) {
        const {data, groupId} = await saveGroup(req.params.groupid, req.body)
        await syncGroup(groupId, data)
        await syncUsers()

        const group = await loadGroup(groupId)
        group._name = req.params.groupid
        group._newName = groupId
        await pingGroups([groupId])
        res.end(JSON.stringify(group))
    })

    app.get('/api/groups/:groupid/delete', async function(req, res) {
        const groupId = req.params.groupid
        const groupFile = path.join(app.config.sfu.path.groups, `${groupId}.json`)
        app.logger.info(`removing group file ${groupFile}`)
        await fs.remove(groupFile)
        const {groupNames} = await loadGroups()
        await syncUsers()
        await pingGroups([groupId])
        res.end(JSON.stringify(groupNames))
    })

}
