#!/usr/bin/env node

import express from 'express'

import {initMiddleware} from './lib/middleware.js'
import path from 'path'
import rc from 'rc'
import winston from 'winston'
import {verifyConfig, verifySFU} from './lib/sanity.js'

const settings = rc('pyrite', {
    listen: {
        host: '127.0.0.1',
        port: 3030,
    },
    logger: {
        level: 'info',
    },
    session: {
        cookie: {maxAge: 1000 * 60 * 60 * 24}, // One day
        resave: false,
        saveUninitialized:true,
    },
    sfu: {
        path: null,
        url: 'http://localhost:8443',
    },
})

delete settings._

const logFormat = winston.format.printf(({level, message, timestamp}) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
})

const app = express()
app.config = {
    path:  {
        base: path.join(path.dirname(import.meta.url).replace('file://', ''), '..'),
    },
}
app.logger = winston.createLogger({
    colorize: true,
    format: winston.format.json(),
    level: settings.logger.level,
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

;(async() => {
    await verifyConfig(app)
    await verifySFU()

    initMiddleware()

    app.listen(settings.listen.port, settings.listen.host, () => {
        app.logger.info(`listening host: ${settings.listen.host}:${settings.listen.port}`)

        if (process.env.PYRITE_NO_SECURITY) {
            app.logger.warn('SESSION SECURITY IS DISABLED')
        }
    })
})()

export default app
