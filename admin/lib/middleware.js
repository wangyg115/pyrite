import apiDashboard from '../api/dashboard.js'
import apiGroups from '../api/groups.js'
import apiProfile from '../api/profile.js'
import apiRecordings from '../api/recordings.js'
import apiUsers from '../api/users.js'
import app from '../app.js'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import expressWinston from 'express-winston'

import {loadUser} from './user.js'

import path from 'path'
import sessions from 'express-session'

// These endpoints are allowed to bypass the authentication middleware:
const endpointAllowList = [
    '/api/context',
    '/api/login',
    '/api/groups/public',
]

export async function authMiddleware(req, res, next) {
    // Skip static files.
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

export async function initMiddleware() {
    app.use(expressWinston.logger({
        colorize: true,
        expressFormat: true,
        meta: false,
        winstonInstance: app.logger,
    }))

    app.use(cookieParser())
    app.use(sessions(app.settings.session))
    app.use(bodyParser.json())
    app.use(authMiddleware)

    apiDashboard(app)
    apiGroups(app)
    apiProfile(app)
    apiRecordings(app)
    apiUsers(app)

    app.use(express.static(path.join(app.config.path.base, 'ui', 'dist')))
    app.get('/*', (req, res) => {
        res.sendFile(path.join(app.config.path.base, 'ui', 'dist', 'index.html'))
    })
}
