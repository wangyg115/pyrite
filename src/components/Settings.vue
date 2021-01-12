<template>
    <div class="content">
        <header>
            Settings
        </header>

        <section>
            <div v-show="state.connected" id="profile" class="profile">
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

                    <FieldSelect
                        v-model="state.video"
                        help="select the video camera to use"
                        label="Camera"
                        name="language"
                        :options="state.devices.video"
                    />

                    <FieldSelect
                        v-model="state.audio"
                        help="select the video camera to use"
                        label="Microphone"
                        name="language"
                        :options="state.devices.audio"
                    />

                    <FieldCheckbox
                        v-model="state.blackboardMode"
                        help="Stream at extra high resolution"
                        label="Blackboard mode"
                        name="store_key"
                    />
                </fieldset>
            </div>

            <fieldset>
                <legend>Other Settings</legend>

                <FieldSelect
                    v-model="state.send"
                    help="Bandwidth to use when sending media"
                    label="Send"
                    name="send"
                    :options="sendOptions"
                />

                <FieldSelect
                    v-model="state.request"
                    help="Types of media to receive"
                    label="Receive"
                    name="request"
                    :options="receiveOptions"
                />


                <FieldCheckbox
                    v-model="state.activityDetection"
                    help="Detect whether someone is speaking"
                    label="Activity detection"
                    name="store_key"
                />
            </fieldset>
        </section>
    </div>
</template>

<script>

export default {
    name: 'Settings',
    data() {
        return {
            receiveOptions: [
                {id: 'nothing', name: 'Nothing'},
                {id: 'audio', name: 'Audio'},
                {id: 'screenshare', name: 'Screenshare'},
                {id: 'everything', name: 'Everything'}
            ],
            sendOptions: [
                {id: 'lowest', name: 'Lowest'},
                {id: 'low', name: 'Low'},
                {id: 'normal', name: 'Normal'},
                {id: 'unlimited', name: 'Unlimited'}
            ],
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