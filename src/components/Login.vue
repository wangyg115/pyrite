<template>
    <div id="login-container" class="login-container" :class="{invisible: state.connected}">
        <div class="login-box">
            <form id="userform" class="userform">
                <label for="username">Username</label>
                <input
                    id="username"
                    v-model="state.username"
                    autocomplete="username"
                    class="form-control"
                    name="username"
                    type="text"
                >
                <label for="password">Password</label>
                <input
                    id="password"
                    v-model="state.password"
                    autocomplete="current-password"
                    class="form-control"
                    name="password"
                    type="password"
                >
                <label>Auto ready</label>

                <div class="present-switch">
                    <p class="switch-radio">
                        <input
                            id="presentoff"
                            v-model="state.present"
                            checked
                            name="presentradio"
                            type="radio"
                            value=""
                        >
                        <label for="presentoff">Disabled</label>
                    </p>
                    <p class="switch-radio">
                        <input
                            id="presentmike"
                            v-model="state.present"
                            name="presentradio"
                            type="radio"
                            value="mike"
                        >
                        <label for="presentmike">Enable microphone</label>
                    </p>
                    <p class="switch-radio">
                        <input
                            id="presentboth"
                            v-model="state.present"
                            name="presentradio"
                            type="radio"
                            value="both"
                        >
                        <label for="presentboth">Enable camera and microphone</label>
                    </p>
                </div>
                <div class="clear" />
                <div class="connect">
                    <button
                        id="connectbutton"
                        class="btn btn-blue"
                        :disabled="connecting"
                        @click="login"
                    >
                        Connect
                    </button>
                </div>
            </form>
            <div class="clear" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            connecting: false,
            state: app.state
        }
    },
    methods: {
        login() {
            this.connecting = true
            try {
                app.store.save()
                app.serverConnect()
            } finally {
                this.connecting = false
            }
        }
    }
}
</script>