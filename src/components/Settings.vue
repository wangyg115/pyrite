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
            <div id="mediaoptions" class="invisible">
                <fieldset>
                    <legend>Media Options</legend>
                    <label class="sidenav-label-first" for="videoselect">Camera:</label>
                    <select
                        id="videoselect" v-model="videoselect"
                        class="select select-inline"
                        @change="changeVideoSelect"
                    >
                        <option value="">
                            off
                        </option>
                    </select>

                    <label class="sidenav-label" for="audioselect">Microphone:</label>
                    <select
                        id="audioselect" v-model="audioselect"
                        class="select select-inline"
                        @change="changeAudioSelect"
                    >
                        <option value="">
                            off
                        </option>
                    </select>

                    <form>
                        <input
                            id="blackboardbox" v-model="blackboardbox"
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
                        id="sendselect" v-model="sendselect"
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
                        id="requestselect" v-model="requestselect"
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
                        id="activitybox" v-model="activitybox"
                        type="checkbox"
                        @change="changeActivitybox"
                    >
                    <label for="activitybox">Activity detection</label>
                </form>
            </fieldset>

            <form id="fileform">
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
            activitybox: '',
            audioselect: 'off',
            blackboardbox: 'off',
            requestselect: '',
            sendselect: '',
            state: app.state,
            videoselect: 'off',
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
            e.preventDefault()
            if(!(this instanceof HTMLSelectElement))
                throw new Error('Unexpected type for this')
            updateSettings({audio: this.value})
            changePresentation()
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
            e.preventDefault()
            if(!(this instanceof HTMLSelectElement))
                throw new Error('Unexpected type for this')
            updateSettings({video: this.value})
            changePresentation()
        },
        changeBlackboardbox() {
            e.preventDefault()
            if(!(this instanceof HTMLInputElement))
                throw new Error('Unexpected type for this')
            updateSettings({blackboardMode: this.checked})
            changePresentation()
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
            serverConnection.close()
            this.closeNav()
        },
        reflectSettings() {
            let settings = getSettings()
            let store = false

            setLocalMute(settings.localMute)

            let videoselect = getSelectElement('videoselect')
            if(!settings.hasOwnProperty('video') ||
            !selectOptionAvailable(videoselect, settings.video)) {
                settings.video = selectOptionDefault(videoselect)
                store = true
            }
            videoselect.value = settings.video

            let audioselect = getSelectElement('audioselect')
            if(!settings.hasOwnProperty('audio') ||
            !selectOptionAvailable(audioselect, settings.audio)) {
                settings.audio = selectOptionDefault(audioselect)
                store = true
            }
            audioselect.value = settings.audio

            if(settings.hasOwnProperty('request')) {
                getSelectElement('requestselect').value = settings.request
            } else {
                settings.request = getSelectElement('requestselect').value
                store = true
            }

            if(settings.hasOwnProperty('send')) {
                getSelectElement('sendselect').value = settings.send
            } else {
                settings.send = getSelectElement('sendselect').value
                store = true
            }

            getInputElement('activitybox').checked = settings.activityDetection

            getInputElement('blackboardbox').checked = settings.blackboardMode

            if(store)
                storeSettings(settings)
        }
    }
}
</script>