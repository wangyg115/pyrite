<template>
    <section class="c-admin-group-tab-permissions tab-content active">
        <div class="group">
            <div class="group-name" />
            <div class="categories">
                <div class="category" @click="toggleCategory('op')">
                    <span class="tooltip tooltip-left" :data-tooltip="$t('operator permission')">
                        <Icon class="icon-small" name="Operator" />
                    </span>
                </div>
                <div class="category" @click="toggleCategory('presenter')">
                    <span class="tooltip tooltip-left" :data-tooltip="$t('presenter permission')">
                        <Icon class="icon-small" name="Present" />
                    </span>
                </div>
                <div class="category" @click="toggleCategory('other')">
                    <span class="tooltip tooltip-left" :data-tooltip="$t('misc permission')">
                        <Icon class="icon-small" name="OtherPermissions" />
                    </span>
                </div>
            </div>
        </div>

        <div
            v-for="user of $s.admin.users"
            :key="user.name"
            class="group item"
        >
            <div class="group-name" @click="toggleUser(user.name)">
                {{ user.name }}
            </div>

            <div class="categories">
                <div v-for="category of categories" :key="category" class="category">
                    <input v-model="$s.admin.group._permissions[category]" type="checkbox" :value="user.name">
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    data() {
        return {
            // (!) Config directives; not the same as permissions from $s.permissions
            categories: ['op', 'presenter', 'other'],
        }
    },
    methods: {
        async loadGroups() {
            this.$s.admin.groups = await this.app.api.get('/api/groups')
        },
        toggleCategory(category) {
            const allSelected = !this.$s.admin.users.some((i) => !this.$s.admin.group._permissions[category].includes(i.name))
            if (allSelected) {
                this.$s.admin.group._permissions[category] = []
            } else {
                this.$s.admin.group._permissions[category] = this.$s.admin.users.map((i) => i.name)
            }
        },
        toggleUser(username) {
            const allSelected = this.categories.every((c) => this.$s.admin.group._permissions[c].includes(username))
            if (allSelected) {
                for (const category of this.categories) {
                    const userIndex = this.$s.admin.group._permissions[category].indexOf(username)
                    this.$s.admin.group._permissions[category].splice(userIndex, 1)
                }
            } else {
                for (const category of this.categories) {
                    if (!this.$s.admin.group._permissions[category].includes(username)) {
                        this.$s.admin.group._permissions[category].push(username)
                    }
                }
            }
            for (const category of this.categories) {
                this.$s.admin.group._permissions[category].includes(username)
            }
        },
    },
    async mounted() {
        if (this.$s.admin.authenticated && this.$s.admin.permission) {
            this.loadGroups()
        }
    },

})
</script>

<style lang="scss">
.c-admin-group-tab-permissions {

    .group {
        align-items: center;
        display: flex;
        padding: var(--spacer) 0;

        .group-name {
            color: var(--grey-8);
            cursor: pointer;
            flex: 1;
            user-select: none;

            &:hover {
                color: var(--primary-color);
            }
        }

        .categories {
            align-items: center;
            display: flex;
            flex: 2;

            .category {
                align-items: center;
                display: flex;
                justify-content: center;
                margin: 0 var(--spacer);
                width: 75px;

                svg {
                    width: calc(var(--space-1) + 21px);

                    &:hover {
                        color: var(--primary-color);
                    }
                }

                input {
                    margin-right: 0;
                }
            }
        }
    }
}
</style>
