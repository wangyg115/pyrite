export default {
    async saveGroup(groupId, data) {
        const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}`, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })

        const group = await res.json()
        app.$s.admin.groups[app.$s.admin.groups.findIndex((g) => g._name === group._name)] = group
        app.notifier.notify({level: 'info', message: app.$t('Group saved')})
        return group
    },
}
