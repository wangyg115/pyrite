export default function(app) {

    app.get('/api/dashboard', async function(req, res) {
        console.log(app.settings.endpoints.galene)
        // const {groupsData, groupNames} = await loadGroups()
        // await pingGroups(groupNames)
        // res.end(JSON.stringify(groupsData))
    })
}
