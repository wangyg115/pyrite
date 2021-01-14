<template>
    <svg
        class="icon" height="40"
        viewBox="0 0 24 24"
        width="40"
    >
        <component :is="name" />
    </svg>
</template>

<script>
import IconEye from './IconEye.vue'
import IconFullscreen from './IconFullscreen.vue'
import IconGroups from './IconGroups.vue'
import IconLogout from './IconLogout.vue'
import IconMic from './IconMic.vue'
import IconMicMute from './IconMicMute.vue'
import IconPip from './IconPip.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'
import IconWebcam from './IconWebcam.vue'

export default {
  components: {
      eye: IconEye,
      fullscreen: IconFullscreen,
      groups: IconGroups,
      logout: IconLogout,
      mic: IconMic,
      micMute: IconMicMute,
      pip: IconPip,
      screenshare: IconScreenShare,
      stopScreenshare: IconStopScreenShare,
      user: IconUser,
      userUnknown: IconUserUnknown,
      webcam: IconWebcam
  },
  props: {
    name: {
        required: true,
        type: String
    }
  }
}
</script>
