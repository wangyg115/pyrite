export default {
    async saveUser(userId, data) {
        const user = await app.api.post(`/api/users/${userId}`, data)
        app.$s.admin.users[app.$s.admin.users.findIndex((i) => i.id === user.id)] = user
        app.notifier.notify({level: 'info', message: app.$t('User saved')})
        return user
    },
}
