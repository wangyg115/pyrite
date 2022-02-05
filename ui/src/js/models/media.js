import {app} from '@/js/app.js'

class ModelMedia {
    async getUserMedia(presence) {
        app.$s.mediaReady = false
        // Cleanup the old networked stream first:
        if (this.localStream && app.$s.group.connected) {
            app.$m.sfu.delUpMediaKind('camera')
        }

        if (this.localStream) {
            app.$m.sfu.delLocalMedia()
        }

        await this.queryDevices()

        let selectedAudioDevice = false
        let selectedVideoDevice = false

        if (app.$s.devices.mic.selected.id !== null) selectedAudioDevice = {deviceId: app.$s.devices.mic.selected.id}
        if (app.$s.devices.cam.selected.id !== null) selectedVideoDevice = {deviceId: app.$s.devices.cam.selected.id}

        if (presence) {
            if (!presence.cam.enabled) selectedVideoDevice = false
            if (!presence.mic.enabled) selectedAudioDevice = false
            // A local stream cannot be initialized with neither audio and video; return early.
            if (!presence.cam.enabled && !presence.mic.enabled) {
                return
            }
        }

        // Verify whether the local mediastream is using the proper device setup.
        app.logger.debug(`using cam ${app.$s.devices.cam.selected.name}`)
        app.logger.debug(`using mic ${app.$s.devices.mic.selected.name}`)

        if(selectedVideoDevice) {
            if (app.$s.devices.cam.resolution.id === '720p') {
                app.logger.debug(`using 720p resolution`)
                selectedVideoDevice.width = {ideal: 1280, min: 640}
                selectedVideoDevice.height = {ideal: 720, min: 400}
            } else if(app.$s.devices.cam.resolution.id === '1080p') {
                app.logger.debug(`using 1080p resolution`)
                selectedVideoDevice.width = {ideal: 1920, min: 640}
                selectedVideoDevice.height = {ideal: 1080, min: 400}
            }
        }

        const constraints = {
            audio: selectedAudioDevice,
            video: selectedVideoDevice,
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints)

        } catch(message) {
            app.notifier.notify({level: 'error', message})
            return
        }

        // Add local stream to Galène; handle peer connection logic.
        if (app.$s.group.connected) {
            await app.$m.sfu.addUserMedia()
        }

        app.$s.mediaReady = true
        return this.localStream
    }

    async queryDevices() {
        let devices = await navigator.mediaDevices.enumerateDevices()
        const labelnr = {audio: 1, cam: 1, mic: 1}

        const added = []

        app.$s.devices.mic.options = []
        app.$s.devices.cam.options = []
        app.$s.devices.audio.options = []

        for (const device of devices) {
            // The same device may end up in the queryList multiple times;
            // Don't add it twice to the options list.
            if (added.includes(device.deviceId)) {
                continue
            }
            let name = device.label

            if(device.kind === 'videoinput') {
                if(!name) name = `Camera ${labelnr.cam}`
                app.$s.devices.cam.options.push({id: device.deviceId, name})
                labelnr.cam++
            } else if(device.kind === 'audioinput') {
                if(!name) name = `Microphone ${labelnr.mic}`
                app.$s.devices.mic.options.push({id: device.deviceId, name})
                labelnr.mic++
            } else if (device.kind === 'audiooutput') {
                // Firefox doesn't support audiooutput enumeration and setSinkid
                if(!name) name = `Output ${labelnr.audio}`
                app.$s.devices.audio.options.push({id: device.deviceId, name})
                labelnr.audio++
            }

            added.push(device.deviceId)
        }

        // Set default audio/video options when none is set.
        if (app.$s.devices.mic.selected.id === null && app.$s.devices.mic.options.length) {
            app.$s.devices.mic.selected = app.$s.devices.mic.options[0]
        }

        if (app.$s.devices.cam.selected.id === null && app.$s.devices.cam.options.length) {
            app.$s.devices.cam.selected = app.$s.devices.cam.options[0]
        }

        if (app.$s.devices.audio.selected.id === null && app.$s.devices.audio.options.length) {
            app.$s.devices.audio.selected = app.$s.devices.audio.options[0]
        }

        app.logger.debug(`device list updated`)
    }
}

export default ModelMedia
