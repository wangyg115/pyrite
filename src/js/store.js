import {reactive} from 'vue'

const persistantState = reactive({
    activityDetection: false,
    audio: null,
    blackboardMode: false,
    chat: {
        active: true,
    },
    loading: true,
    localMute: false,
    password: 'marley',
    permissionText: '',
    present: '', // '', mike or 'both'
    request: 'everything',
    resolution: null,
    send: 'normal',
    title: '',
    username: 'bob',
    video: null,
})

/**
 * State is always overwritten by these properties.
 */
const volatileState = {
    connected: false,
    devices: {
        audio: [],
        video: [],
    },
    notifications: [],
    peers: [],
    permissions: {
        op: false,
        // Assume present permission before connecting,
        // so send can be modified in Settings.
        present: true,
        record: false,
    },
    upMedia: {
        audio: [],
        local: [],
        screenshare: [],
        video: [],
    },
}


class Store {

    load() {
        let restoredState
        try {
            restoredState = JSON.parse(sessionStorage.getItem('store'))
        } catch (err) {
            restoredState = {}
        }

        Object.assign(persistantState, {...restoredState, ...volatileState})
        return persistantState
    }

    save() {
        sessionStorage.setItem('store', JSON.stringify(persistantState))
    }
}


export default Store