import apiGroups from './api/groups.js'
import apiProfile from './api/profile.js'
import apiUsers from './api/users.js'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import fs from 'fs-extra'

import path from 'path'
import pino from 'pino'
import rc from 'rc'
import sessions from 'express-session'

import userTemplate from './lib/user.js'

console.log(userTemplate)

const basedir =path.dirname(import.meta.url).replace('file://', '')

const settings = rc('pyrite', {
    endpoints: {
        galene: 'http://localhost:8443',
    },
    paths: {
        data: path.join(basedir, '..', '..', 'galene', 'data'),
        groups: path.join(basedir, '..', '..', 'galene', 'groups'),
        recordings: path.join(basedir, '..', '..', 'galene', 'recordings'),
    },
    port: 3030,
    session: {
        cookie: {maxAge: 1000 * 60 * 60 * 24}, // One day
        resave: false,
        saveUninitialized:true,
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    },
})

globalThis.app = express()
app.logger = pino({prettyPrint: true})
app.settings = settings

const usersFile = path.join(app.settings.paths.data, 'users.json');

(async() => {
    const exists = await fs.pathExists(usersFile)
    if (!exists) {
        await fs.writeJson(usersFile, userTemplate)
    }
})()

app.use(cookieParser())
app.use(sessions(settings.session))
app.use(bodyParser.json())

apiGroups(app)
apiProfile(app)
apiUsers(app)

app.listen(3030, () => {
    app.logger.info("Pyrite manager listening on port 3030")
})

