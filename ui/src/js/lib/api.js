export default class Api {
    constructor() {

    }

    async get(endpoint) {
        const res = await fetch(endpoint, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'GET',
        })

        if (res.status === 401) {
            app.router.push({name: 'admin-login'})
            return {status: 'unauthorized'}
        } else {
            return await res.json()
        }

    }

    async post(endpoint, data) {
        return await (await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })).json()
    }

}
