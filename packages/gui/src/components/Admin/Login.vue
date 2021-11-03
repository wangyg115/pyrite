<template>
    <div class="c-admin-login content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('Admin Login') }}</span>
                <Icon class="item-icon icon-small" name="Dashboard" />
            </div>
        </header>
        <div class="panels">
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
            </section>
            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$t('login as admin')"
                    @click="login"
                >
                    <Icon class="icon-small" name="Login" />
                </button>
            </div>
        </div>
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
            this.$s.admin.authenticated = status.authenticated
            if (!status.authenticated) {
                app.notifier.notify({level: 'error', message: this.$t('Invalid credentials')})
            } else {
                app.notifier.notify({level: 'info', message: this.$t('succesfully logged in')})
                app.router.push({name: 'admin-users'})
            }
        },
    },
})
</script>

