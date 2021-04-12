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
                <div class="field">
                    <label>{{ $t('Media') }}</label>

                    <div class="present-switch">
                        <input
                            id="presentoff"
                            v-model="$s.present"
                            checked
                            name="presentradio"
                            type="radio"
                            value=""
                        >
                        <label class="tooltip" :data-tooltip="$t('Disabled')" for="presentoff">
                            <Icon class="icon" name="MicMute" />
                        </label>

                        <input
                            id="presentmike"
                            v-model="$s.present"
                            name="presentradio"
                            type="radio"
                            value="mike"
                        >
                        <label class="tooltip" :data-tooltip="$t('Microphone')" for="presentmike">
                            <Icon class="icon" name="Mic" />
                        </label>
                        <input
                            id="presentboth"
                            v-model="$s.present"
                            name="presentradio"
                            type="radio"
                            value="both"
                        >
                        <label
                            class="tooltip" :data-tooltip="$t('Camera and microphone')"
                            for="presentboth"
                        >
                            <Icon class="icon" name="Webcam" />
                        </label>
                    </div>
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

<style lang="postcss">
.present-switch {
    margin: var(--space-1) 0;

    & input {        
        display: none; 

        & + label {
            margin-right: var(--space-1);
            overflow: auto;

            &::before {
                background: var(--primary-color);
                bottom: calc(-1 * var(--border));
                content: "";
                height: var(--border);
                left: 0;
                position: absolute;
                right: 0;
                transform: scaleX(0);
                transform-origin: 0 0;
                transition: transform 150ms;
                will-change: transform;
            }
        }
    }

    & .icon {
        border-bottom: 2px solid transparent;
        
    }

    & input:checked + label {

        &::before {
            transform: scaleX(1);
        }

        & .icon {
            fill: var(--primary-color);
        }
    }

    & input:not(:checked) + label {

        &:hover {

            &::before {
                transform: scaleX(1);
            }
        }

        & .icon:hover {
            cursor: pointer;
        }
    }

}
</style>
