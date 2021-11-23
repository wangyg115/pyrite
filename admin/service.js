import apiDashboard from './api/dashboard.js'
import apiGroups from './api/groups.js'
import apiProfile from './api/profile.js'
import apiRecordings from './api/recordings.js'
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
import winston from 'winston'
import {loadUser, userTemplate} from './lib/user.js'

const settings = rc('pyrite', {
    galene: {
        admin: {
            password: '',
            username: '',
        },
        basedir: null,
        url: 'http://localhost:8443',
    },
    logger: {
        level: 'info',
    },
    port: 3030,
    session: {
        cookie: {maxAge: 1000 * 60 * 60 * 24}, // One day
        resave: false,
        saveUninitialized:true,
    },
})

let basedir = path.join(path.dirname(import.meta.url).replace('file://', ''), '..')

let galeneBasedir
if (settings.galene.basedir) {
    galeneBasedir = settings.galene.basedir
} else {
    galeneBasedir = path.join(basedir, 'galene')
}

settings.paths = {
    data: path.join(galeneBasedir, 'data'),
    groups: path.join(galeneBasedir, 'groups'),
    recordings: path.join(galeneBasedir, 'recordings'),
}

const logFormat = winston.format.printf(({level, message, timestamp}) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
})

globalThis.app = express()
app.logger = winston.createLogger({
    colorize: true,
    format: winston.format.json(),
    level: settings.logger.level,
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'}),
    ],
})

if (settings.session.secret === 'changeme: e.g. openssl rand -base64 36') {
    console.error('Please use a random session secret in .pyriterc')
    process.exit(1)
}

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

// These endpoints are allowed to bypass the authentication middleware:
const endpointAllowList = [
    '/api/context',
    '/api/login',
]

async function endpointAuthentication(req, res, next) {
    if (!req.url.startsWith('/api')) {
        next()
        return
    }

    const session=req.session

    if (endpointAllowList.includes(req.originalUrl)) {
        next()
    } else if (session.userid) {
        const user = await loadUser(session.userid)
        // For now, only admin users may access endpoints.
        if (user && user.admin) {
            next()
        } else {
            res.status(401).send('Unauthorized')
        }
    } else {
        if (process.env.PYRITE_NO_SECURITY) {
            // Development flag may override security.
            next()
        } else {
            res.status(401).send('Unauthorized')
        }
    }
}

app.use(endpointAuthentication)

apiDashboard(app)
apiGroups(app)
apiProfile(app)
apiRecordings(app)
apiUsers(app)

app.use(express.static('ui/dist'))
app.get('/*', (req, res) => {
    res.sendFile(path.join(basedir, 'ui', 'dist', 'index.html'))
})

app.listen(settings.port, () => {
    app.logger.info(`pyrite service listening on port ${settings.port}`)
    app.logger.debug(`galène basedir: ${basedir}`)
    app.logger.debug(`galène endpoint: ${settings.galene.url}`)
    if (process.env.PYRITE_NO_SECURITY) {
        app.logger.warn('SESSION SECURITY IS DISABLED')
    }
})

