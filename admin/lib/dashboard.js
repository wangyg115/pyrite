import app from '../app.js'
import fetch from 'node-fetch'

export async function loadStats(groupId) {
    const headers = new fetch.Headers()
    const {username, password} = app.config.sfu.admin
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')}`
    headers.append('Authorization', authHeader)
    const stats = await (await fetch(`${app.settings.sfu.url}/stats.json`, {headers})).json()
    return stats.find((i) => i.name === groupId)

}
