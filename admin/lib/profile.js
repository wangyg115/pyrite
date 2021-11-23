import {loadGroups} from './group.js'
import {loadUsers} from './user.js'

export async function authContext() {
    const [{groupsData}, users] = await Promise.all([loadGroups(), loadUsers()])
    return {authenticated: true, groups: groupsData, users}
}

export async function noAuthContext() {
    return {authenticated: false}
}
