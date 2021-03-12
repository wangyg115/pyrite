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
import chat from './IconChat.vue'
import chatClose from './IconChatClose.vue'
import eye from './IconEye.vue'
import error from './IconError.vue'
import fullscreen from './IconFullscreen.vue'
import groups from './IconGroups.vue'
import headset from './IconHeadset.vue'
import info from './IconInfo.vue'
import logo from './IconLogo.vue'
import login from './IconLogin.vue'
import logout from './IconLogout.vue'
import mic from './IconMic.vue'
import micMute from './IconMicMute.vue'
import operator from './IconOperator.vue'
import pip from './IconPip.vue'
import playFile from './IconPlayFile.vue'
import present from './IconPresent.vue'
import user from './IconUser.vue'
import userUnknown from './IconUserUnknown.vue'
import screenshare from './IconScreenShare.vue'
import send from './IconSend.vue'
import settings from './IconSettings.vue'
import settingsMisc from './IconSettingsMisc.vue'
import stopScreenshare from './IconStopScreenShare.vue'
import warning from './IconWarning.vue'
import webcam from './IconWebcam.vue'

export default {
  components: {
      chat,
      chatClose,
      eye,
      error,
      fullscreen,
      groups,
      headset,
      info,
      login,
      logo,
      logout,
      mic,
      micMute,
      operator,
      pip,
      playFile,
      present,
      screenshare,
      send,
      settings,
      settingsMisc,
      stopScreenshare,
      user,
      userUnknown,
      warning,
      webcam
  },
  props: {
    name: {
        required: true,
        type: String
    }
  }
}
</script>
<style lang="postcss">
.icon {
    fill: currentColor;
    height: 40px;
    width: 40px;

    &.icon-tiny {
        height: calc(var(--space-1) / 2);
        width: calc(var(--space-1) / 2);
    }

    &.icon-mini {
        height: var(--space-1);
        width: var(--space-1);
    }

    &.icon-small {
        height: var(--space-2);
        width: var(--space-2);
    }

    &.icon-large {
        height: 50px;
        width: 50px;
    }
}


</style>