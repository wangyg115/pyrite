import crypto from 'crypto'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import os from 'os'
import path from 'path'
import {saveUser, userTemplate} from './user.js'

export async function verifyConfig() {
    const configFile = path.join(process.env.HOME, '.pyriterc')
    if (!await fs.pathExists(path.join(configFile))) {
        app.logger.info('no settings file found; generate one...')
        const config = await inquirer.prompt([
            {
                message: 'Path to Galène SFU:',
                name: 'sfuPath',
                type: 'input',
            },
        ])

        app.settings.session.secret = crypto.randomBytes(20).toString('hex')

        const sfuPathParts = config.sfuPath.split(path.sep)
        if (sfuPathParts[0] === '~') {
            sfuPathParts[0] = os.homedir()
        }

        sfuPathParts.reduce((memo, part) => path.join(memo, part), '')
        app.settings.sfu.path = sfuPathParts.reduce((memo, part) => path.join(memo, part), '')

        await fs.writeFile(configFile, JSON.stringify(app.settings, null, '  '))
        app.logger.info(`config file written to: ${configFile}`)
    }

    app.config.sfu = {
        path: {
            data: path.join(app.settings.sfu.path, 'data'),
            groups: path.join(app.settings.sfu.path, 'groups'),
            recordings: path.join(app.settings.sfu.path, 'recordings'),
        },
    }
}

export async function verifySFU() {
    if (!await fs.pathExists(app.config.sfu.path.data)) {
        app.logger.info(`creating sfu path: ${app.config.sfu.path.data}`)
        await fs.mkdir(app.config.sfu.path.data)
    }

    if (!await fs.pathExists(app.config.sfu.path.groups)) {
        app.logger.info(`creating sfu path: ${app.config.sfu.path.groups}`)
        await fs.mkdir(app.config.sfu.path.groups)
    }

    if (!await fs.pathExists(app.config.sfu.path.recordings)) {
        app.logger.info(`creating sfu path: ${app.config.sfu.path.recordings}`)
        await fs.mkdir(app.config.sfu.path.recordings)
    }

    const usersFile = path.join(app.config.sfu.path.data, 'users.json')
    const exists = await fs.pathExists(usersFile)
    if (!exists) {
        app.logger.info('writing initial users.json')
        const user = userTemplate({admin: true, name: 'pyrite'})
        await saveUser(user.id, user)
    }

    const configFile = path.join(app.config.sfu.path.data, 'config.json')
    if (!await fs.pathExists(configFile)) {
        app.logger.info(`creating sfu config: ${configFile}`)
        await fs.writeFile(configFile, JSON.stringify({
            admin: [{password: crypto.randomBytes(20).toString('hex'), username: 'admin'}],
        }, null, '  '))
    }

    const config = JSON.parse(await fs.readFile(configFile, 'utf-8'))
    app.config.sfu.admin = {
        password: config.admin[0].password,
        username: config.admin[0].username,
    }

    // Test sfu endpoint
    const authHeader = `Basic ${Buffer.from(`${app.config.sfu.admin.username}:${app.config.sfu.admin.password}`, 'utf-8').toString('base64')}`
    const headers = new fetch.Headers()
    headers.append('Authorization', authHeader)

    try {
        const res = await fetch(`${app.settings.sfu.url}/stats.json`, {headers})
        if (res.status === 401) {
            app.logger.error('sfu endpoint unauthorized; check sfu config')
            process.exit(1)
        }
    } catch(err) {
        app.logger.error(`sfu not detected (${app.settings.sfu.url})`)
        process.exit(1)
    }
}
