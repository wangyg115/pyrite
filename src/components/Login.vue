<template>
    <div class="c-login content">
        <header>
            <Icon class="item-icon icon-small" name="Login" /><em>{{ $route.params.groupId }}</em>
        </header>
        <section>
            <form>
                <FieldText
                    v-model="$s.username"
                    autocomplete="username"
                    :label="$t('Username')"
                    name="username"
                    placeholder="Alice, Bob, Carol..."
                />

                <FieldText
                    v-model="$s.password"
                    autocomplete="current-password"
                    :label="$t('Password')"
                    name="pasword"
                    placeholder="Alice, Bob, Carol..."
                    type="password"
                />

                <label>{{ $t('Media on join') }}</label>

                <div class="present-switch">
                    <p class="switch-radio">
                        <input
                            id="presentoff"
                            v-model="$s.present"
                            checked
                            name="presentradio"
                            type="radio"
                            value=""
                        >
                        <label for="presentoff">{{ $t('Disabled') }}</label>
                    </p>
                    <p class="switch-radio">
                        <input
                            id="presentmike"
                            v-model="$s.present"
                            name="presentradio"
                            type="radio"
                            value="mike"
                        >
                        <label for="presentmike">{{ $t('Microphone') }}</label>
                    </p>
                    <p class="switch-radio">
                        <input
                            id="presentboth"
                            v-model="$s.present"
                            name="presentradio"
                            type="radio"
                            value="both"
                        >
                        <label for="presentboth">{{ $t('Camera and microphone') }} </label>
                    </p>
                </div>
            </form>

            <button
                id="connectbutton"
                class="btn btn-widget"
                :disabled="connecting"
                @click="login"
            >
                {{ $t('join group') }}
            </button>
        </section>
    </div>
</template>

<script>
export default {
    data() {
        return {
            connecting: false,
        }
    },
    methods: {
        login() {
            this.connecting = true
            try {
                app.store.save()
                app.connect()
            } finally {
                this.connecting = false
            }
        },
    },
}
</script>
