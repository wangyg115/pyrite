<template>
    <transition-group class="c-notifications" name="notification" tag="div">
        <div
            v-for="notification in state.notifications"
            :key="state.notifications.indexOf(notification)"
            class="notification"
            :class="{[notification.level]: true}"
        >
            <Icon class="icon icon-small" :name="notification.level[0].toUpperCase() + notification.level.slice(1)" />
            <div class="message">
                {{ notification.message }}
                <span v-if="notification.link" class="cf link" @click="openUrl(notification.link.url)">{{ notification.link.text }}</span>
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

<style lang="postcss">

.c-notifications {
    max-width: 400px;
    position: absolute;
    right: var(--spacer);
    top: var(--spacer);
    width: 100%;
    z-index: 100000;

    & .notification {
        align-items: center;
        background: var(--grey-400);
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
        color: var(--grey-50);
        display: flex;
        flex-direction: row;
        font-style: italic;
        font-weight: 400;
        height: $spacer * 7;
        justify-content: space-between;
        margin: var(--spacer) calc(var(--spacer) / 2);
        padding: var(--spacer);
        transition: all 0.25s;

        & .icon {
            margin: var(--spacer);
            width: var(--space-3);
        }

        &.info .icon {
            color: var(--info-color);
        }

        &.warning .icon {
            background: var(--warning-color);
        }

        &.error .icon {
            color: var(--error-color);
        }

        & .message {
            flex: 1;
        }
    }
}

.test .c-notifications {
    display: none;
}
</style>
