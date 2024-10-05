import type { Notification } from '@/scripts/types';
import { reactive } from 'vue';

export const notify = reactive({
    messages: [] as Notification[],

    push: function (message: Notification) {
        this.messages = [...this.messages, message];

        setTimeout(() => {
            this.remove(this.messages.length - 1);
        }, 10000);
    },

    remove: function (index: number) {
        this.messages.splice(index, 1);
    }
});