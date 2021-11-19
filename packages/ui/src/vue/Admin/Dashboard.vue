<template>
    <div class="c-admin-groups-dashboard content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('Dashboard') }}</span>
                <Icon class="icon icon-regular" name="Dashboard" />
            </div>
        </header>

        <section>
            <svg class="chart" viewBox="0 0 500 100">
                <polyline
                    fill="none"
                    points="
                        0,120
                        20,60
                        40,80
                        60,20"
                    stroke="#0074d9"
                    stroke-width="3"
                />
            </svg>
        </section>
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    async loadStats() {
        await app.api.get('/api/dashboard/')
    },
    setup() {

    },
})
</script>

<style lang="scss">

</style>
