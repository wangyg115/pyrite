import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import {globby} from 'globby'
import Joi from 'joi'
import path from 'path'
import pino from 'pino'
import sessions from 'express-session'

const basedir =path.dirname(import.meta.url).replace('file://', '')

const galeneEndpoint = 'http://localhost:8443'
const groupsDir = path.join(basedir, '..', '..', 'galene', 'groups')
const dataDir = path.join(basedir, '..', '..', 'galene', 'data')

const logger = pino({
    prettyPrint: true,
})

const app = express()
const oneDay = 1000 * 60 * 60 * 24
app.use(cookieParser())
app.use(sessions({
    cookie: {maxAge: oneDay},
    resave: false,
    saveUninitialized:true,
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
}))
app.use(bodyParser.json())

app.listen(3030, () => {
    logger.info("Pyrite manager listening on port 3030")
})

/**
 * Retrieve the current user's manager context.
 */
app.get('/api/context', async function(req, res) {
    const session=req.session
    if (session.userid ) {
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

/**
 * Login as manager with the credentials from data/passwd.
 */
app.post('/api/login', async function(req, res) {
    const targetFile = path.join(dataDir, 'passwd')
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
 * Retrieve a list of all users.
 */
app.get('/api/users', async function(req, res) {
    const targetFile = path.join(dataDir, 'users.json')
    const userData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
    res.end(JSON.stringify(userData))
})

app.post('/api/users', async function(req, res) {
    const targetFile = path.join(dataDir, 'users.json')
    const userData = JSON.stringify(req.body)
    await fs.promises.writeFile(targetFile, userData)
    res.end(JSON.stringify({status: 'ok'}))
})

/**
 * Retrieve a list of all groups.
 */
app.get('/api/groups', async function(req, res) {
    const files = await globby(path.join(groupsDir, '**'))

    const fileData = await Promise.all(files.map((i) => fs.promises.readFile(i, 'utf8')))
    const groupNames = files.map((i) => {
        return i.replace(groupsDir, '').replace('.json', '').replace('/', '')
    })
    const groupData = []
    for (const [index, groupName] of groupNames.entries()) {
        const data = JSON.parse(fileData[index])
        data.name = groupName
        groupData.push(data)
    }
    // Keep Galene in sync with the group data.
    await Promise.all(groupNames.map((i) => fetch(`${galeneEndpoint}/group/${i}`)))
    res.end(JSON.stringify(groupData))
})

/**
 * Retrieve an existing group.
 */
app.get('/api/groups/:groupid', async function(req, res) {
    const groupId = req.params.groupid
    // Basic path traversal protection
    if (groupId.match(/\.\.\//g) !== null) {
        res.end(JSON.stringify({error: 'invalid group id'}))
        return
    }

    const targetFile = path.join(groupsDir, `${groupId}.json`)
    const groupData = JSON.parse(await fs.promises.readFile(targetFile, 'utf8'))
    groupData.name = groupId
    res.end(JSON.stringify(groupData))
})

/**
 * Edit an existing group or create a new group
 * when it doesn't exist yet.
 */
app.post('/api/groups/:groupid', async function(req, res) {
    const groupId = req.params.groupid
    const targetFile = path.join(groupsDir, `${groupId}.json`)

    await fs.promises.writeFile(targetFile, JSON.stringify(req.body))
    res.end(JSON.stringify({status: 'ok'}))
})

/**
 * Delete an existing group.
 */
app.get('/manager/groups/:groupname/delete', async function(req, res) {
    const groupName = req.params.groupname
    const groupFile = path.join(groupsDir, `${groupName}.json`)
    logger.info(`removing group file ${groupFile}`)
    await fs.remove(groupFile)
    await fetch(`${galeneEndpoint}/group/${groupName}`)
    res.end(JSON.stringify({status: 'ok'}))
})

