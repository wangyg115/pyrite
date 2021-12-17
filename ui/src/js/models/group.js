export default {
    async saveGroup(groupId, data) {
        const group = await app.api.post(`/api/groups/${encodeURIComponent(groupId)}`, data)

        if (group._name === group._newName) {
            app.notifier.notify({level: 'info', message: app.$t('group {group} stored', {group: group._name})})
            app.$s.admin.groups[app.$s.admin.groups.findIndex((g) => g._name === group._name)] = group
        } else {
            const groupIndex = app.$s.admin.groups.findIndex((g) => g._name === group._name)
            group._name = group._newName
            app.$s.admin.groups[groupIndex] = group

            app.notifier.notify({
                level: 'info',
                message: app.$t('group {oldgroup} renamed to {newgroup}', {
                    newgroup: group._name,
                    oldgroup: group._newName,
                }),
            })
        }

        return group
    },
}
