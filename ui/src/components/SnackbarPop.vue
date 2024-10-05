<template>
    <main>
        <div class="snackbars">
            <div v-for="(message, index) in notify.messages" :key="index" :class="`snackbar ${message.category}`">
                <div class="indicator"></div>
                <SuccessIcon v-if="message.category == 'success'" class="icon" />
                <FailedIcon v-if="message.category == 'error'" class="icon" />
                <div class="texts">
                    <h3>{{ message.title }}</h3>
                    <p>{{ message.description }}</p>
                </div>
                <CloseIcon class="close" v-on:click="removeIndex(index)" />

                <a target="_blank" v-if="message.linkUrl && message.linkUrl != '' && message.linkUrl.startsWith('http')"
                    v-on:click="removeIndex(index)" :href="message.linkUrl">
                    <div class="link">
                        <p>{{ message.linkTitle }}</p>
                        <OutIcon />
                    </div>
                </a>

                <RouterLink v-else-if="message.linkUrl && message.linkUrl != ''" :to="message.linkUrl"
                    v-on:click="removeIndex(index)">
                    <div class="link">
                        <p>{{ message.linkTitle }}</p>
                        <OutIcon />
                    </div>
                </RouterLink>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import CloseIcon from '@/components/icons/CloseIcon.vue';
import SuccessIcon from '@/components/icons/SuccessIcon.vue';
import FailedIcon from '@/components/icons/FailedIcon.vue';
import OutIcon from '@/components/icons/OutIcon.vue';

import { notify } from '@/reactives/notify';

const removeIndex = (index: number) => {
    notify.remove(index);
};
</script>

<style scoped>
.snackbars {
    position: fixed;
    right: 20px;
    bottom: 0;
    z-index: 10;
    width: 500px;
    max-width: calc(100% - 20px);
}

.snackbar {
    width: 100%;
    background: var(--bg-light);
    box-shadow: 0px 6px 12px rgba(20, 20, 22, 0.8);
    border-radius: 4px;
    margin-bottom: 25px;
    padding: 20px 16px;
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    animation: slide_in_up .2s ease-in-out;
}

.indicator {
    width: 6px;
    height: 56px;
    border-radius: 1px;
}

.success .indicator {
    background: var(--sm-green);
}

.error .indicator {
    background: var(--sm-red);
}

.icon {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    padding: 4px;
}

.success .icon {
    background: var(--sm-green);
}

.error .icon {
    background: var(--sm-red);
}

.close {
    position: absolute;
    top: 12px;
    right: 18px;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: var(--bg);
    padding: 4px;
    cursor: pointer;
}

.texts h3 {
    font-size: 16px;
    color: var(--tx-normal);
}

.texts p {
    font-size: 14px;
    margin-top: 14px;
    color: var(--tx-dimmed);
}

.link {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg);
    border-radius: 4px;
    padding: 0 12px;
    height: 30px;
    bottom: 16px;
    right: 18px;
}

.link p {
    font-size: 12px;
    color: var(--tx-normal);
}

.link svg {
    width: 14px;
    height: 14px;
}

@media screen and (max-width: 800px) {
    .snackbar {
        padding: 16px 10px;
        margin-bottom: 10px;
        gap: 12px;
        right: 50%;
        transform: translate(-50%, 0);
    }

    .indicator {
        width: 4px;
        height: 46px;
    }

    .icon {
        width: 24px;
        height: 24px;
    }

    .close {
        top: 10px;
        right: 10px;
    }

    .texts h3 {
        font-size: 14px;
    }

    .texts p {
        font-size: 12px;
        margin-top: 10px;
    }

    .link {
        gap: 4px;
        padding: 0 6px;
        height: 24px;
        bottom: 10px;
        right: 10px;
    }


    .link p {
        font-size: 10px;
    }

    .link svg {
        width: 12px;
        height: 12px;
    }
}
</style>