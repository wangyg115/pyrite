<template>
    <div class="c-login content" @keypress.enter="login">
        <header>
            <div class="notice">
                <Hint v-if="$s.group.locked" class="field" :text="$t('Only maintainers may login locked groups')" />
            </div>
            <div class="title">
                <span>{{ $route.params.groupId }}</span>
                <Icon class="icon icon-regular" :name="$s.group.locked ? 'GroupLocked' : 'Group'" />
            </div>
        </header>
        <div class="panels">
            <section>
                <form>
                    <FieldText
                        v-model="v$.user.username.$model"
                        autocomplete="username"
                        :autofocus="$route.params.groupId"
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

                    <div class="field presence-setup">
                        <label class="uc">{{ $t('presence') }}</label>
                        <div class="media">
                            <div class="media-option">
                                <FieldSelect
                                    v-model="$s.devices.cam.selected"
                                    :disabled="!$s.devices.cam.enabled"
                                    :help="$t('select the video device')"
                                    :label="$t('camera')"
                                    name="video"
                                    :options="$s.devices.cam.options"
                                >
                                    <template #header>
                                        <FieldCheckbox v-model="$s.devices.cam.enabled" />
                                    </template>
                                </FieldSelect>
                            </div>

                            <div class="media-option">
                                <FieldSelect
                                    v-model="$s.devices.mic.selected"
                                    :disabled="!$s.devices.mic.enabled"
                                    :help="$t('select the microphone device')"
                                    :label="$t('microphone')"
                                    name="audio"
                                    :options="$s.devices.mic.options"
                                >
                                    <template #header>
                                        <FieldCheckbox v-model="$s.devices.mic.enabled" />
                                    </template>
                                </FieldSelect>
                            </div>

                            <div v-if="!app.env.isFirefox" class="media-option">
                                <FieldSelect
                                    v-model="$s.devices.audio.selected"
                                    :help="app.env.isFirefox ? `${app.env.browserName} ${$t('does not support this option')}` : $t('select the microphone device')"
                                    :label="$t('audio output')"
                                    name="audio"
                                    :options="$s.devices.audio.options"
                                />
                            </div>
                        </div>

                        <div class="verify ucfl">
                            <RouterLink :to="{name: 'conference-settings', params: {tabId: 'devices'}}">
                                {{ $t('verify') }}
                            </RouterLink>
                            {{ $t('microphone & video settings') }}
                        </div>
                    </div>
                </form>
            </section>
            <div class="actions">
                <button
                    class="btn btn-menu tooltip tooltip-left"
                    :data-tooltip="$s.group.locked ? $t('join locked group') : $t('join group')"
                    :disabled="btnLoginDisabled"
                    @click="login"
                >
                    <Icon class="icon-small" name="Login" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {required} from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

export default {
    computed: {
        btnLoginDisabled() {
            if (this.connecting || !this.$s.user.username || !this.$s.user.password) {
                return true
            }
            // Server validation should not disable the login button.
            const hasErrors = this.v$.$silentErrors.filter((v) => v.$validator !== '$externalResults').length > 0
            return hasErrors
        },
    },

    data() {
        return {
            connecting: false,
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

            this.connecting = true
            try {
                await this.$m.sfu.connect()

            } catch(err) {
                if (err === 'group is locked') {
                    this.app.notifier.notify({
                        level: 'error',
                        message: this.$t('group {group} is locked; only maintainers may login', {group: this.$s.group.name}),
                    })
                    this.vuelidateExternalResults.user.username = [this.$t('group {group} has been locked')]
                    this.vuelidateExternalResults.user.password = [this.$t('group {group} has been locked')]
                } else if (err === 'not authorised') {
                    const message = this.$t('invalid credentials for group {group}', {group: this.$s.group.name})
                    this.app.notifier.notify({level: 'error', message})
                    this.vuelidateExternalResults.user.username = [message]
                    this.vuelidateExternalResults.user.password = [message]
                    this.v$.$validate()
                }
            }

            this.connecting = false
            if (this.v$.$invalid) return

            // Save credentials for the next time.
            this.app.store.save()

            this.$s.group.connected = true
            this.$router.replace({
                name: 'conference-groups-connected',
                params: {groupId: this.$router.currentRoute.value.params.groupId},
            })

        },
    },
    async mounted() {
        await this.$m.media.queryDevices()
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
}
</script>

<style lang="scss">
.c-login {

    header {
        text-transform: uppercase;
    }

    .presence-setup {

        .media {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: var(--space-1);

            .media-option {
                align-items: center;
                display: flex;
                width: calc(50% - var(--spacer));

                .field {
                    background: var(--grey-4);
                    padding: var(--spacer);
                }
            }
        }

        label {
            font-family: var(--font-secondary);
        }

        .verify {
            font-style: italic;
            font-weight: 600;
            margin-top: var(--space-1);
        }
    }
}

</style>
