<script setup lang="ts">
import ChevronDownIcon from './icons/ChevronDownIcon.vue';
import CloseIcon from './icons/CloseIcon.vue';
import SearchIcon from './icons/SearchIcon.vue';
import { findCollectionsByNameOrAddress } from '@/scripts/collection';
import Converter from '@/scripts/converter';
import { ref } from 'vue';
import type { Token } from '@/scripts/types';

const emit = defineEmits(['close', 'onTokenChanged']);
const props = defineProps({
    chainId: { type: Number, required: true }
});

const searchValue = ref('');
const tokens = ref<Token[]>([
    {
        tokenId: '0x00000001',
        name: 'Happy Ape',
        image: '/images/nft1.webp'
    },
    {
        tokenId: '0x00000001',
        name: 'Happy Ape',
        image: '/images/nft2.webp'
    },
    {
        tokenId: '0x00000001',
        name: 'Happy Ape',
        image: '/images/nft3.avif'
    }
]);
const activeCollection = ref<string | undefined>(undefined);

const expandCollection = (collectionAddress: string | undefined) => {
    if (activeCollection.value == collectionAddress) {
        activeCollection.value = undefined;
    } else {
        activeCollection.value = collectionAddress;
    }
};
</script>

<template>
    <div class="container">
        <div class="collection_box">
            <div class="collection_box_header">
                <h3>Select NFT Token</h3>
                <CloseIcon @click="emit('close')" />
            </div>

            <div class="search">
                <div class="search_box">
                    <SearchIcon />
                    <input type="text" v-model="searchValue" placeholder="Search by collection name or address">
                </div>
            </div>

            <!-- <div class="popular_collections">
                <button class="popular_collection" v-for="collection, index in popularCollection(props.chainId)"
                    :key="index">
                    <img :src="collection.image" :alt="collection.name">
                    <p>{{ collection.symbol }}</p>
                </button>
            </div> -->

            <div class="collections">
                <div class="collection_detail"
                    v-for="collection, index in findCollectionsByNameOrAddress(searchValue, props.chainId)"
                    :key="index">
                    <div class="collection" @click="expandCollection(collection.addresses[props.chainId])">
                        <div class="collection_info">
                            <img :src="collection.image" :alt="collection.name">
                            <div class="collection_name">
                                <p>{{ collection.name }}</p>
                                <p>{{ collection.symbol }}</p>
                            </div>
                        </div>

                        <div class="collection_amount">
                            <p class="collection_balance">--</p>
                            <div class="collection_address">
                                <p>
                                    {{ Converter.fineAddress(collection.addresses[props.chainId] || '------------', 4)
                                    }}
                                </p>
                                <ChevronDownIcon
                                    :style="`rotate: ${(activeCollection == collection.addresses[props.chainId] ? 180 : 0)}deg`" />
                            </div>
                        </div>
                    </div>

                    <div class="tokens" v-if="activeCollection == collection.addresses[props.chainId]">
                        <div class="token" v-for="token, index in tokens" :key="index"
                            @click="emit('onTokenChanged', collection, token)">
                            <div class="token_info">
                                <img :src="token.image" :alt="token.name">
                                <p>Token Id <br> {{ Converter.fineAddress(token.tokenId, 2) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="info">
                    <p>Default list may not include all collections.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    z-index: 10;
}

.collection_box {
    background: var(--bg-light);
    width: 440px;
    overflow: hidden;
}

.collection_box_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 20px;
}

.collection_box_header svg {
    width: 30px;
    height: 30px;
    cursor: pointer;
}

.collection_box_header h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--tx-normal);
}

.search {
    padding: 0 20px;
}

.search_box {
    padding: 0 10px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--border);
}

.search_box input {
    height: 40px;
    background: none;
    border: none;
    outline: none;
    color: var(--tx-normal);
    font-size: 16px;
    font-weight: 500;
}

/* .popular_collections {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 12px;
    padding: 16px 20px;
}

.popular_collection {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 4px;
    padding-right: 8px;
}

.popular_collection img {
    width: 24px;
    height: 24px;
    object-fit: cover;
}

.popular_collection p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-normal);
} */

.collections {
    height: 420px;
    max-height: 50vh;
    overflow-y: auto;
    margin-top: 20px;
}

.collection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 65px;
    cursor: pointer;
}

.collection:hover {
    background: var(--bg-light);
}

.collection_info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.collection_name p:first-child {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-normal);
}

.collection_name p:last-child {
    font-size: 12px;
    font-weight: 400;
    color: var(--tx-dimmed);
    margin-top: 2px;
}

.collection img {
    width: 24px;
    height: 30px;
    object-fit: cover;
}

.collection_amount {
    text-align: right;
}

.collection_balance {
    font-size: 14px;
    font-weight: 500;
    color: var(--tx-normal);
}

.collection_address {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
}

.collection_address p {
    font-size: 12px;
    font-weight: 400;
    color: var(--tx-dimmed);
}

.info {
    padding: 20px 20px 30px 20px;
}

.info p {
    color: var(--tx-dimmed);
    font-size: 12px;
    text-align: center;
}

.tokens {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 20px;
    gap: 12px;
}

.token {
    gap: 6px;
    position: relative;
    cursor: pointer;
}

.token img {
    width: 80px;
    height: 100px;
    object-fit: cover;
}

.token p {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    text-align: center;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: #051419c1;
    top: 0;
    left: 0;
    color: var(--tx-normal);
    font-size: 12px;
    font-weight: 500;
}

.token p:hover {
    background: #05141997;
}

@media screen and (max-width: 800px) {
    .container {
        align-items: flex-end;
    }

    .collections {
        max-height: 40vh;
    }
}
</style>