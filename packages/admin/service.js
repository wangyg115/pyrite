import apiGroups from './api/groups.js'
import apiProfile from './api/profile.js'
import apiUsers from './api/users.js'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import expressWinston from 'express-winston'
import fs from 'fs-extra'

import path from 'path'

import rc from 'rc'
import {saveUser} from './lib/user.js'
import sessions from 'express-session'
import {userTemplate} from './lib/user.js'
import winston from 'winston'

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

const logFormat = winston.format.printf(({level, message, timestamp}) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
})

globalThis.app = express()
app.logger = winston.createLogger({
    colorize: true,
    format: winston.format.json(),
    level: 'info',
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'}),
    ],
})

if (process.env.NODE_ENV !== 'production') {
    app.logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            logFormat,
        ),
        level: 'debug',
    }))
}

app.settings = settings

const usersFile = path.join(app.settings.paths.data, 'users.json');

// Start with a default users.json
(async() => {
    const exists = await fs.pathExists(usersFile)
    if (!exists) {
        app.logger.info('writing initial users.json')
        const user = userTemplate({admin: true, name: 'pyrite'})
        await saveUser(user.id, user)
    }
})()

app.use(expressWinston.logger({
    colorize: true,
    expressFormat: true,
    meta: false,
    winstonInstance: app.logger,
}))

app.use(cookieParser())
app.use(sessions(settings.session))
app.use(bodyParser.json())

apiGroups(app)
apiProfile(app)
apiUsers(app)

app.listen(3030, () => {
    app.logger.info(`pyrite admin service listening on port ${settings.port}`)
})

