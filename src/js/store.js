import {reactive} from 'vue'

const persistantState = reactive({
    devices: {
        cam: {
            enabled: true,
            options: [],
            resolution: {id: 'default', name: 'Default'},
            selected: {id: null, name: ''},
        },
        mic: {
            enabled: true,
            options: [],
            selected: {id: null, name: ''},
        },
    },
    language: {id: 'en'},
    loading: true,
    media: {
        accept: {id: 'everything', name: 'Everything'},
        upstream: {id: 'normal', name: 'Normal'},
    },
    permissions: {},
    user: {
        id: null,
        name: '',
        password: '',
        status: {},
    },
})

/**
 * State is always overwritten by these properties.
 */
const volatileState = {
    chat: {
        channel: 'main',
        channels: {
            main: {
                id: 'main',
                messages: [],
                name: 'General',
                unread: 0,
            },
        },
        hidden: false,
        width: 350,
    },
    group: {
        connected: false,
        locked: false,
        muted: false,
        name: '',
        recording: false,
    },
    mediaReady: false,
    notifications: [],
    permissions: {
        op: false,
        // Assume present permission before connecting,
        // so send can be modified in Settings.
        present: true,
        record: false,
    },
    streams: [],
    upMedia: {
        audio: [],
        camera: [],
        screenshare: [],
        video: [],
    },
    users: [],
}

class Store {

    load() {
        let restoredState
        try {
            restoredState = JSON.parse(localStorage.getItem('store'))
        } catch (err) {
            restoredState = {}
        }

        Object.assign(persistantState, {...restoredState, ...volatileState})
        return persistantState
    }

    save() {
        localStorage.setItem('store', JSON.stringify(persistantState))
    }
}

export default Store
