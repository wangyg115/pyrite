<template>
    <div id="sidebarnav" class="sidenav">
        <div class="sidenav-header">
            <h2>Settings</h2>
            <a id="clodeside" class="closebtn" @click="closeSide"><i aria-hidden="true" class="fas fa-times" /></a>
        </div>
        <div id="optionsdiv" class="sidenav-content">
            <div id="profile" class="profile invisible" :class="{invisible: !state.connected}">
                <div class="profile-user">
                    <div class="profile-logo">
                        <span><i aria-hidden="true" class="fas fa-user" /></span>
                    </div>
                    <div class="profile-info">
                        <span v-if="state.password && state.username" id="userspan">
                            {{ state.username }}
                        </span>

                        <span id="permspan">{{ state.permissionText }}</span>
                    </div>
                    <div class="user-logout">
                        <a id="disconnectbutton" @click="disconnect">
                            <span class="logout-icon"><i class="fas fa-sign-out-alt" /></span>
                            <span class="logout-text">Logout</span>
                        </a>
                    </div>
                </div>
            </div>
            <div v-show="state.permissions.present" id="mediaoptions">
                <fieldset>
                    <legend>Media Options</legend>
                    <label class="sidenav-label-first" for="videoselect">Camera:</label>
                    <select
                        id="videoselect" v-model="state.video"
                        class="select select-inline"
                        @change="changeVideoSelect"
                    >
                        <option
                            v-for="video of state.devices.video" :key="video.id"
                            :selected="video.id === state.video"
                            :value="video.id"
                        >
                            {{ video.label }}
                        </option>
                    </select>

                    <label class="sidenav-label" for="audioselect">Microphone:</label>
                    <select
                        id="audioselect" v-model="state.audio"
                        class="select select-inline"
                        @change="changeAudioSelect"
                    >
                        <option v-for="audio of state.devices.audio" :key="audio.id" :value="audio.id">
                            {{ audio.label }}
                        </option>
                    </select>

                    <form>
                        <input
                            id="blackboardbox" v-model="state.blackboardMode"
                            type="checkbox"
                            @change="changeBlackboardbox"
                        >
                        <label for="blackboardbox">Blackboard mode</label>
                    </form>
                </fieldset>
            </div>

            <fieldset>
                <legend>Other Settings</legend>

                <form id="sendform">
                    <label class="sidenav-label-first" for="sendselect">Send:</label>
                    <select
                        id="sendselect" v-model="state.send"
                        class="select select-inline"
                        @change="changeSendSelect"
                    >
                        <option value="lowest">
                            lowest
                        </option>
                        <option value="low">
                            low
                        </option>
                        <option selected value="normal">
                            normal
                        </option>
                        <option value="unlimited">
                            unlimited
                        </option>
                    </select>
                </form>

                <form id="requestform">
                    <label class="sidenav-label" for="requestselect">Receive:</label>
                    <select
                        id="requestselect" v-model="state.request"
                        class="select select-inline"
                        @change="changeRequestSelect"
                    >
                        <option value="">
                            nothing
                        </option>
                        <option value="audio">
                            audio only
                        </option>
                        <option value="screenshare">
                            screen share
                        </option>
                        <option selected value="everything">
                            everything
                        </option>
                    </select>
                </form>

                <form>
                    <input
                        id="activitybox" v-model="activityDetection"
                        type="checkbox"
                        @change="changeActivitybox"
                    >
                    <label for="activitybox">Activity detection</label>
                </form>
            </fieldset>

            <form v-show="state.permissions.present" id="fileform">
                <label class=".sidenav-label-first" for="fileinput">Play local file:</label>
                <input
                    id="fileinput" accept="audio/*,video/*"
                    multiple
                    type="file"
                    @change="changeFileInput"
                >
            </form>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Settings',
    data() {
        return {
            state: app.state,
        }
    },
    methods: {
        changeActivitybox(e) {
            if(!(this instanceof HTMLInputElement))
                throw new Error('Unexpected type for this')
            updateSettings({activityDetection: this.checked})
            for(let id in serverConnection.down) {
                let c = serverConnection.down[id]
                if(this.checked)
                    c.setStatsInterval(activityDetectionInterval)
                else {
                    c.setStatsInterval(0)
                    setActive(c, false)
                }
            }
        },
        changeAudioSelect() {
            app.store.save()
            if (this.state.connected) {
                app.changePresentation()
            }
        },
        changeFileInput() {
            if(!(this instanceof HTMLInputElement))
                throw new Error('Unexpected type for this')
            let input = this
            let files = input.files
            for(let i = 0; i < files.length; i++)
                addFileMedia(files[i])
            input.value = ''
            this.closeNav()
        },
        changeVideoSelect() {
            app.store.save()
            if (this.state.connected) {
                app.changePresentation()
            }
        },
        changeBlackboardbox() {
            app.store.save()
            app.changePresentation()
        },
        changeRequestSelect() {
            e.preventDefault()
            if(!(this instanceof HTMLSelectElement))
                throw new Error('Unexpected type for this')
            updateSettings({request: this.value})
            serverConnection.request(this.value)
        },
        async changeSendSelect() {
            if(!(this instanceof HTMLSelectElement))
            throw new Error('Unexpected type for this')
            updateSettings({send: this.value})
            let t = getMaxVideoThroughput()
            for(let id in serverConnection.up) {
                let c = serverConnection.up[id]
                await setMaxVideoThroughput(c, t)
            }
        },
        closeNav() {
            document.getElementById("sidebarnav").style.width = "0"
        },
        closeSide() {
            this.closeNav()
        },
        disconnect() {
            app.connection.close()
            this.closeNav()
        }
    }
}
</script>