<template>
    <form class="c-login">
        <h2>Join group {{ $route.params.groupId }}</h2>
        <FieldText
            v-model="state.username"
            autocomplete="username"
            label="Username"
            name="username"
            placeholder="Alice, Bob, Carol..."
        />

        <FieldText
            v-model="state.password"
            autocomplete="current-password"
            label="Password"
            name="pasword"
            placeholder="Alice, Bob, Carol..."
            type="password"
        />

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
        <div class="clear" />
    </form>
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
<style lang="postcss">
.c-login {
    background: var(--grey-400);
    overflow: auto;
}
</style>