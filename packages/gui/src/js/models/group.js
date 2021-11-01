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

        if (group._name === group._newName) {
            app.notifier.notify({level: 'info', message: app.$t('Group "{groupId}" saved', {groupId: group._name})})
            app.$s.admin.groups[app.$s.admin.groups.findIndex((g) => g._name === group._name)] = group
        } else {
            const groupIndex = app.$s.admin.groups.findIndex((g) => g._name === group._name)
            group._name = group._newName
            app.$s.admin.groups[groupIndex] = group

            app.notifier.notify({
                level: 'info',
                message: app.$t('Group "{oldGroupId}" renamed to "{newGroupId}"', {
                    newGroupId: group._newName,
                    oldGroupId: group._name,
                }),
            })
        }

        return group
    },
}
