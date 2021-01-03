<template>
    <transition-group class="c-notifications" name="notification" tag="div">
        <div
            v-for="item in state.notifications"
            :key="state.notifications.indexOf(item)"
            class="notification"
            :class="classes('notification', item)"
        >
            <div class="icon">
                <!-- <icon v-if="item.icon" :name="item.icon" /> -->
            </div>
            <div class="msg">
                {{ item.message }}
                <span v-if="item.link" class="cf link" @click="openUrl(item.link.url)">{{ item.link.text }}</span>
            </div>
        </div>
    </transition-group>
</template>

<script>
export default {
    data() {
        return {
            state: app.state
        }
    },
    methods: {
        classes: function(block, notification) {
            let classes = {}
            if (block === 'notification') {
                classes[notification.level] = true
            }
            return classes
        },
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
    bottom: var(--spacer);
    max-width: 400px;
    position: absolute;
    right: var(--spacer);
    width: 100%;
    z-index: 100000;

    & .notification {
        align-items: center;

        color: var(--grey-50);
        display: flex;
        flex-direction: row;
        font-weight: 600;
        height: $spacer * 7;
        justify-content: space-between;
        margin: calc(var(--spacer) / 2);
        padding: var(--spacer);
        transition: all 0.25s;

        &.info { background: var(--info-color); }
        &.warning { background: var(--warning-color); }
        &.error { background: var(--error-color); }
    }
}

.test .c-notifications {
    display: none;
}

</style>