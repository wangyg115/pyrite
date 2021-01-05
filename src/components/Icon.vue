<template>
    <svg
        class="icon"
        height="40"
        viewBox="0 0 25 25"
        width="40"
    >

        <component :is="name" />
    </svg>
</template>

<script>
import IconMute from './icons/IconMute.vue'
import IconScreenShare from './icons/IconScreenShare.vue'
import IconStopScreenShare from './icons/IconStopScreenShare.vue'
export default {
  components: {
      mute: IconMute,
      screenshare: IconScreenShare,
      stopScreenshare: IconStopScreenShare,
  },
  props: {
    name: {
        required: true,
        type: String
    }
  }
}
</script>

<style scoped>
svg {
    display: inline-block;
    margin-bottom: -2px; /* yes, I'm that particular about formatting */
    vertical-align: baseline;
}
</style>