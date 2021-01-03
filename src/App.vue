<template>
    <router-view />
    <Settings />
</template>

<script>

import Settings from './components/Settings.vue'

export default {
    name: 'App',
    components: {
        Settings
    },
}
</script>
