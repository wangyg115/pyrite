<template>
    <nav class="c-controls">
        <div class="navigational-controls">
            <RouterLink class="btn btn-menu tooltip" data-tooltip="settings" :to="{name: 'settings'}">
                <Icon class="icon-small" name="settings" />
            </RouterLink>
            <RouterLink
                v-if="state.group" class="btn btn-menu tooltip"
                data-tooltip="current group"
                :to="{name: 'groups', params: {groupId: state.group}}"
            >
                <Icon class="icon-small" name="groups" />
            </RouterLink>
            <button v-else class="btn btn-menu" disabled>
                <Icon class="icon-small" name="groups" />
            </button>
            <button
                v-if="state.connected"
                class="btn btn-menu tooltip"
                data-tooltip="leave group"
                @click="disconnect"
            >
                <Icon class="icon-small" name="logout" />
            </button>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            state: app.state
        }
    },
    methods: {
        disconnect() {
            app.disconnect()
        },
        toggleMute() {
            this.state.muted = !this.state.muted
            app.muteLocalTracks(this.state.muted)
        },
        togglePresent() {
            if (this.state.upMedia.local.length) {
                app.logger.debug('switching present mode off')
                app.delUpMediaKind('local')

            } else {
                app.logger.debug('switching present mode on')
                let id = app.findUpMedia('local')
                if(!id) {
                    app.addLocalMedia()
                }
            }
        },
        toggleShare() {
            if (this.state.upMedia.screenshare.length) {
                app.logger.debug('switching screenshare off')
                app.delUpMediaKind('screenshare')
            } else {
                app.logger.debug('switching screenshare on')
                app.addShareMedia()
            }
        }
    }
}
</script>

<style lang="postcss">
.c-controls {
    background: var(--grey-400);
    border-right: var(--border) solid var(--grey-300);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>