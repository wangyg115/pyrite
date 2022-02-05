<template>
    <div class="c-admin-login content" @keypress.enter="login">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('admin login') }}</span>
                <Icon class="item-icon icon-small" name="Dashboard" />
            </div>
        </header>
        <div class="panels">
            <section>
                <form>
                    <FieldText
                        v-model="username"
                        autocomplete="username"
                        :autofocus="true"
                        :label="$t('username')"
                        name="username"
                        placeholder="Alice, Bob, Carol..."
                    />

                    <FieldText
                        v-model="password"
                        autocomplete="password"
                        :label="$t('password')"
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
            const context = await this.app.api.post('/api/login', {
                password: this.password,
                username: this.username,
            })

            Object.assign(this.$s.admin, context)

            if (!context.authenticated) {
                this.app.notifier.notify({level: 'error', message: this.$t('invalid credentials')})
            } else {
                this.app.notifier.notify({level: 'info', message: this.$t('succesfully logged in')})
                this.$router.push({name: 'admin-users'})
            }
        },
    },
})
</script>

