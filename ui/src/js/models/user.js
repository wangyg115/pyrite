import {app} from '@/js/app.js'

class ModelUser {
    async saveUser(userId, data) {
        const user = await app.api.post(`/api/users/${userId}`, data)
        app.$s.admin.users[app.$s.admin.users.findIndex((i) => i.id === user.id)] = user
        app.notifier.notify({level: 'info', message: app.$t('person stored')})
        return user
    }
}
export default ModelUser
