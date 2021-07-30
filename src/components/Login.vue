<template>
    <div class="c-login content">
        <header>
            <Icon class="item-icon icon-small" name="Login" /><em>{{ $route.params.groupId }}</em>
        </header>
        <section>
            <Hint v-if="$s.group.locked" class="field" :text="$t('This group is currently locked. Only maintainers may login.')" />
            <form>
                <FieldText
                    v-model="$s.user.name"
                    autocomplete="username"
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
                            :help="$t('Select the camera device')"
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
                            :to="{name: 'settings', params: {tabId: 'devices'}}"
                        >
                            Verify
                        </RouterLink>
                        {{ $t('microphone & camera settings') }}
                    </div>
                </div>
            </form>

            <button
                id="connectbutton"
                class="btn btn-widget"
                :class="{warning: $s.group.locked}"
                :disabled="connecting"
                @click="login"
            >
                <template v-if="$s.group.locked">
                    {{ $t('join locked group') }}
                </template>
                <template v-else>
                    {{ $t('join group') }}
                </template>
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
        async login() {
            this.connecting = true
            try {
                app.store.save()
                await app.connect()
            } finally {
                this.connecting = false
                this.$router.replace({name: 'groupsConnected', params: {groupId: this.$router.currentRoute.value.params.groupId}})
            }
        },
    },
    async mounted() {
        await app.setMediaChoices()
    },
}
</script>

<style lang="scss">
.presence-setup {

    label {
        font-family: var(--font-secondary);
    }

    .mic,
    .cam {
        align-items: center;
        background: var(--grey-500);
        border: 2px solid var(--grey-300);
        display: flex;
        margin: var(--space-1) 0;
        padding: var(--spacer);
    }

    .c-field-select {
        padding: 0;
    }

    .c-field-checkbox {
        padding-left: 0;

        label {
            margin-right: 0;
        }
    }

    .verify {
        font-style: italic;
        font-weight: 600;
        margin-bottom: var(--space-2);
    }
}
</style>
