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
import IconError from './IconError.vue'
import IconFullscreen from './IconFullscreen.vue'
import IconGroups from './IconGroups.vue'
import IconHeadset from './IconHeadset.vue'
import IconInfo from './IconInfo.vue'
import IconLogout from './IconLogout.vue'
import IconMic from './IconMic.vue'
import IconMicMute from './IconMicMute.vue'
import IconPip from './IconPip.vue'
import IconUser from './IconUser.vue'
import IconUserUnknown from './IconUserUnknown.vue'
import IconScreenShare from './IconScreenShare.vue'
import IconSend from './IconSend.vue'
import IconSettings from './IconSettings.vue'
import IconSettingsMisc from './IconSettingsMisc.vue'
import IconStopScreenShare from './IconStopScreenShare.vue'
import IconWarning from './IconWarning.vue'
import IconWebcam from './IconWebcam.vue'

export default {
  components: {
      eye: IconEye,
      error: IconError,
      fullscreen: IconFullscreen,
      groups: IconGroups,
      headset: IconHeadset,
      info: IconInfo,
      logout: IconLogout,
      mic: IconMic,
      micMute: IconMicMute,
      pip: IconPip,
      screenshare: IconScreenShare,
      send: IconSend,
      settings: IconSettings,
      settingsMisc: IconSettingsMisc,
      stopScreenshare: IconStopScreenShare,
      user: IconUser,
      userUnknown: IconUserUnknown,
      warning: IconWarning,
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
