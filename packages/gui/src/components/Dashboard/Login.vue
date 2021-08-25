<template>
    <div class="c-dashboard-login content">
        <header>
            <Icon class="item-icon icon-small" name="Dashboard" />Dashboard
        </header>
        <section>
            <form>
                <FieldText
                    v-model="username"
                    autocomplete="username"
                    :label="$t('Username')"
                    name="username"
                    placeholder="Alice, Bob, Carol..."
                />

                <FieldText
                    v-model="password"
                    autocomplete="password"
                    :label="$t('Password')"
                    name="pasword"
                    placeholder="Alice, Bob, Carol..."
                    type="password"
                />
            </form>
            <button
                class="btn btn-widget btn-save"
                @click="login"
            >
                {{ $t('Login Dashboard') }}
            </button>
        </section>
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    data() {
        return {
            password: '',
            username: '',
        }
    },
    methods: {
        async login() {
            const res = await fetch('/api/login', {
                body: JSON.stringify({password: this.password, username: this.username}),
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })

            const status = await res.json()
            this.$s.manager.authenticated = status.authenticated
        },
    },
})
</script>

