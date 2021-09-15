import bodyParser from 'body-parser'
import express from 'express'
import {globby} from 'globby'
import fetch from 'node-fetch'
import path from 'path'
import fs from 'fs-extra'
import Joi from 'joi'
import pino from 'pino'
import {fstat} from 'fs'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'

const basedir =path.dirname(import.meta.url).replace('file://', '')

const galeneEndpoint = 'http://localhost:8443'
const groupsDir = path.join(basedir, '..', '..', 'galene', 'groups')

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

const manager = {
    password: 'tester',
    username: 'tester',
}

app.listen(3030, () => {
    logger.info("Pyrite manager listening on port 3030")
})

app.get('/api/context', async function(req, res) {
    const session=req.session
    if (session.userid ) {
        res.end(JSON.stringify({authenticated: true}))
    } else {
        res.end(JSON.stringify({authenticated: false}))
    }
})

app.get('/api/logout',(req, res) => {
    req.session.destroy()
})

app.post('/api/login', async function(req, res) {
    const username = req.body.username
    const password = req.body.password

    if (manager.username === username && manager.password === password) {
        const session = req.session
        session.userid = username
        res.end(JSON.stringify({authenticated: true}))
    }

    res.end(JSON.stringify({authenticated: false}))
})

app.get('/api/groups', async function(req, res) {
    const files = await globby(path.join(groupsDir, '**'))

    const fileData = await Promise.all(files.map((i) => fs.promises.readFile(i, 'utf8')))
    const groupNames = files.map((i) => i.replace(groupsDir, '').replace('.json', ''))
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

app.post('/api/groups/:groupname/', async function(req, res) {
    console.log('REQ', req)
})

/**
 * Delete a group from the Galene groups directory
 * and notify Galene about it.
 */
app.get('/manager/groups/:groupname/delete', async function(req, res) {
    const groupName = req.params.groupname
    const groupFile = path.join(groupsDir, `${groupName}.json`)
    logger.info(`removing group file ${groupFile}`)
    await fs.remove(groupFile)
    await fetch(`${galeneEndpoint}/group/${groupName}`)
    res.end(JSON.stringify({status: 'ok'}))
})

