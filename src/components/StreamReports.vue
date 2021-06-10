<template>
    <div class="c-stream-reports">
        <div class="sections">
            <button
                v-for="(reportType, reportTypeName) of filteredReports" :key="reportTypeName" 
                class="btn btn-menu compact no-feedback stats-type tooltip tooltip-right" 
                :class="{ active: activeReport.name === reportTypeName}"
                :data-tooltip="reportTypeName" 
                @click="setActiveReport(reportType, reportTypeName)"
            >
                <Icon class="icon-mini" name="ScreenShare" />
            </button>
        </div>

        <div v-if="activeReport.data" class="stats">
            <div v-for="(stats, reportId) of activeReport.data" :key="reportId" class="stat">
                <div class="title">
                    {{ stats.kind }}
                </div>
                <div class="value">
                    <div v-for="stat of stats" :key="stat.id">
                        {{ stat }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        filteredReports: function() {
            const reports = {}
            const ignoreList = ['id', 'type']
            for (const [reportName, report] of Object.entries(this.reports)) {
                reports[reportName] = {}

                for (const [statsName, stats] of Object.entries(report)) {
                    const _stats = {}

                    for (const [statName, stat] of Object.entries(stats)) {
                        if (!ignoreList.includes(statName)) {
                            _stats[statName] = stat
                        }
                    }
                    reports[reportName][statsName] = _stats
                }
            }

            return reports
        },
    },
    data() {
        return {
            activeReport: {
                data: null,
                name: null,
            },
        }
    },
    methods: {
        setActiveReport(data, name) {
            this.activeReport = {data, name}
        },
    },
    props: {
        reports: {
            default: () => {},
            type: Object,
        },
    },
}
</script>

<style lang="postcss">
.c-stream-reports {
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: absolute;
    width: 100%;

    & .sections {
        display: flex;
        flex-wrap: wrap;
    }

    & .stats-type {
        background: none;
        color: #fff;
    }

    & .title {
        font-weight: bold;
    }

    & .stats {
        display: none;
        gap: var(--spacer);
        margin-top: var(--spacer);
        overflow-y: scroll;

        & .stat {

            .title {
                font-weight: bold;
            }
        }
    }

    &:hover {
        cursor: pointer;

        & .stats {
            display: flex;
        }
    }
}
</style>
