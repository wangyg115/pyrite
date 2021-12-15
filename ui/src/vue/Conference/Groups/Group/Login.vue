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
                        v-model="$s.user.username"
                        autocomplete="username"
                        :autofocus="$route.params.groupId"
                        :label="$t('Username')"
                        name="username"
                        placeholder="Alice, Bob, Carol..."
                    />

                    <FieldText
                        v-model="$s.user.password"
                        autocomplete="password"
                        :label="$t('Password')"
                        name="pasword"
                        placeholder="Alice, Bob, Carol..."
                        type="password"
                    />

                    <div class="field presence-setup">
                        <label>{{ $t('Presence') }}</label>
                        <div class="cam">
                            <FieldCheckbox v-model="$s.devices.cam.enabled" />
                            <FieldSelect
                                v-model="$s.devices.cam.selected"
                                :disabled="!$s.devices.cam.enabled"
                                :help="$t('Select the video device')"
                                :label="$t('Camera')"
                                name="video"
                                :options="$s.devices.cam.options"
                            />
                        </div>

                        <div class="mic">
                            <FieldCheckbox v-model="$s.devices.mic.enabled" />
                            <FieldSelect
                                v-model="$s.devices.mic.selected"
                                :disabled="!$s.devices.mic.enabled"
                                :help="$t('Select the microphone device')"
                                :label="$t('Microphone')"
                                name="audio"
                                :options="$s.devices.mic.options"
                            />
                        </div>
                        <div class="verify">
                            <RouterLink
                                :to="{name: 'conference-settings', params: {tabId: 'devices'}}"
                            >
                                {{ $t('Verify') }}
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
                    :disabled="connecting"
                    @click="login"
                >
                    <Icon class="icon-small" name="Login" />
                </button>
            </div>
        </div>
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
        async login() {
            this.connecting = true
            try {
                app.store.save()
                await app.connect()
            } finally {
                this.connecting = false
                this.$router.replace({
                    name: 'conference-groups-connected',
                    params: {groupId: this.$router.currentRoute.value.params.groupId},
                })
            }
        },
    },
    async mounted() {
        await app.queryDevices()
    },

}
</script>

<style lang="scss">
.c-login {

    header {
        text-transform: uppercase;
    }

    .presence-setup {

        label {
            font-family: var(--font-secondary);
        }

        .mic,
        .cam {
            align-items: center;
            background: var(--grey-2);
            border: 2px solid var(--grey-4);
            display: flex;
            margin: var(--space-1) 0;
            padding: var(--spacer);

            .c-field-checkbox {
                padding-left: 0;
                padding-right: var(--spacer);

                label {
                    margin-right: 0;
                }
            }
        }

        .c-field-select {
            padding: 0;
        }

        .verify {
            font-style: italic;
            font-weight: 600;
            margin-bottom: var(--space-2);
        }
    }
}

</style>
