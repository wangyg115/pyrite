<template>
    <transition-group class="c-notifications" name="c-notifications" tag="div">
        <div
            v-for="notification in $s.notifications"
            :key="$s.notifications.indexOf(notification)"
            class="notification"
            :class="{[notification.level]: true}"
        >
            <div class="message">
                <Icon class="icon icon-small" :name="notification.level[0].toUpperCase() + notification.level.slice(1)" />
                <div class="text">
                    {{ notification.message }}
                    <span v-if="notification.link" class="cf link" @click="openUrl(notification.link.url)">{{ notification.link.text }}</span>
                </div>
            </div>
            <div v-if="notification.personal" class="personal">
                <div class="op">
                    <span v-if="notification.personal.op">{{ $t('Operator') }} {{ notification.personal.op }}:</span>
                    <span v-else-if="notification.personal.group">{{ $t('Group') }} {{ notification.personal.group }}:</span>
                </div>
                <div class="message">
                    {{ notification.personal.message }}
                </div>
            </div>
        </div>
    </transition-group>
</template>

<script>
export default {
    data() {
        return {
            state: app.state,
        }
    },
    methods: {
        close: function(notification) {
            let notifications = this.notifications.filter((i) => i.id !== notification.id)
            app.setState({app: {notifications}})
        },
        openUrl: function(url) {
            window.open(url, '_blank')
        },
    },
    store: {
        notifications: 'app.notifications',
        session: 'session',
    },
}
</script>

<style lang="scss">

.c-notifications {
    bottom: var(--spacer);
    display: flex;
    flex-direction: column-reverse;
    font-family: var(--font-secondary);
    font-style: italic;
    font-weight: 400;
    max-width: 400px;
    overflow: hidden;
    position: absolute;
    right: var(--spacer);
    width: 100%;
    z-index: 100000;

    &-enter-active,
    &-leave-active {
        transition: all 0.3s ease-in-out;
    }

    &-enter-from {
        transform: translateY(100px);
    }

    &-enter-from,
    &-leave-to {
        opacity: 0;
    }

    &-leave-to {
        transform: translateY(0);
    }

    .notification {
        align-items: stretch;
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        height: calc(var(--spacer * 7));
        margin: var(--spacer) calc(var(--spacer) / 2);
        padding: var(--spacer);

        &.info {
            background: var(--grey-7);
            color: var(--grey-2);
        }

        &.warning {
            background: var(--warning-color-u);
            color: var(--warning-color-d);
        }

        &.error {
            background: var(--error-color-u);
            color: var(--error-color-d);
        }

        .message {
            align-items: center;
            display: flex;

            .icon {
                height: var(--space-2);
                margin: var(--spacer);
                width: var(--space-2);
            }
        }

        .personal {

            .source {
                font-weight: 600;
            }

            .message {
                font-style: italic;
            }
        }
    }
}

.test .c-notifications {
    display: none;
}
</style>
