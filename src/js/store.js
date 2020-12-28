import {reactive} from 'vue'

const state = reactive({
    connected: false,
    devices: {
        audio: [],
        video: [],
    },
    loading: true,
    password: 'marley',
    permissionText: '',
    present: '', // '', mike or 'both'
    title: '',
    username: 'bob',
})


class Store {

    load() {
        try {
            Object.assign(state, JSON.parse(sessionStorage.getItem('store')))
        } catch (err) {
            // Silently fail
        }
        return state
    }

    save() {
        sessionStorage.setItem('store', JSON.stringify(state))
    }
}


export default Store