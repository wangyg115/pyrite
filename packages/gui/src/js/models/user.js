export default {
    async saveUser(userId, data) {
        const res = await fetch(`/api/users/${userId}`, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })

        const user = await res.json()
        app.$s.admin.users[app.$s.admin.users.findIndex((i) => i.id === user.id)] = user
        app.notifier.notify({level: 'info', message: app.$t('User saved')})
        return user
    },
}
