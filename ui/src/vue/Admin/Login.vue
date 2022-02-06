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
                        v-model="v$.user.username.$model"
                        autocomplete="username"
                        :autofocus="true"
                        :label="$t('username')"
                        name="username"
                        placeholder="Alice, Bob, Carol..."
                        :validation="v$.user.username"
                    />

                    <FieldText
                        v-model="v$.user.password.$model"
                        autocomplete="password"
                        :label="$t('password')"
                        name="pasword"
                        placeholder="Alice, Bob, Carol..."
                        type="password"
                        :validation="v$.user.password"
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
import {required} from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

export default defineComponent({
    data() {
        return {
            user: this.$s.user,
            vuelidateExternalResults: {
                user: {
                    password: [],
                    username: [],
                },
            },
        }
    },
    methods: {
        async login() {
            this.vuelidateExternalResults.user.username = []
            this.vuelidateExternalResults.user.password = []

            const context = await this.app.api.post('/api/login', {
                password: this.user.password,
                username: this.user.username,
            })

            Object.assign(this.$s.admin, context)

            if (!context.authenticated || (context.authenticated && !context.permission)) {
                let message

                if (!context.authenticated) {
                    this.app.notifier.notify({level: 'error', message: this.$t('invalid credentials')})
                    message = this.$t('invalid login credentials')
                } else if (context.authenticated && !context.permission) {
                    message = this.$t('this account lacks the right permission')
                }
                this.vuelidateExternalResults.user.username = [message]
                this.vuelidateExternalResults.user.password = [message]

                this.v$.$validate()
            } else {
                this.app.notifier.notify({level: 'info', message: this.$t('succesfully logged in')})
                this.$router.push({name: 'admin-users'})
            }
        },
    },
    setup() {
        return {v$: useVuelidate()}
    },
    validations() {
        return  {
            user: {
                password: {required},
                username: {required},
            },
        }
    },
})
</script>

