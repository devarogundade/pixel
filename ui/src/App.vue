<script setup lang="ts">
import SnackbarPop from '@/components/SnackbarPop.vue';
import { useWalletStore } from '@/stores/wallet';
import { aptosConnectWallet, config, chains, HOLESKY_ID, APTOS_ID } from '@/scripts/connect';
import { UserResponseStatus } from '@aptos-labs/wallet-standard';
import { notify } from '@/reactives/notify';
import Converter from '@/scripts/converter';
import { ref, watch, onMounted } from 'vue';
import { createWeb3Modal } from '@web3modal/wagmi/vue';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { watchAccount } from '@wagmi/core';
import SearchIcon from '@/components/icons/SearchIcon.vue';
import TokenList from '@/components/TokenList.vue';
import type { Collection, Token } from '@/scripts/types';
import { getAllowance, approveToken } from '@/scripts/erc721';
import { ContractID, bridgeToken } from '@/scripts/ethereum';

createWeb3Modal({
  wagmiConfig: config,
  projectId: import.meta.env.VITE_PROJECT_ID,
  // @ts-ignore
  chains: chains,
  enableAnalytics: true
});

const activeTab = ref(0);
const modal = useWeb3Modal();
const tokenListing = ref(false);
const walletStore = useWalletStore();
const approving = ref(false);
const bridging = ref(false);

const bridgeInput = ref({
  collection: undefined as Collection | undefined,
  token: undefined as Token | undefined,
  allowance: false
});

const aptosConnect = async () => {
  const response = await aptosConnectWallet.connect();

  if (response.status == UserResponseStatus.APPROVED) {
    walletStore.setAptosAddress(response.args.address.toString());
  } else {
    notify.push({
      title: 'Error: Failed to connect.',
      description: 'User rejects connection.',
      category: 'error'
    });
  }
};

const onTokenChanged = async (collection: Collection, token: Token) => {
  bridgeInput.value.collection = collection;
  bridgeInput.value.token = token;

  tokenListing.value = false;

  updateApprovals();
};

const updateApprovals = async () => {
  if (!bridgeInput.value.collection || !bridgeInput.value.token) return;

  if (activeTab.value === 0) {
    bridgeInput.value.allowance = await getAllowance(
      bridgeInput.value.collection,
      bridgeInput.value.token,
      ContractID
    );
  } else {
    bridgeInput.value.allowance = true;
  }
};

const bridge = async () => {
  if (!bridgeInput.value.collection || !bridgeInput.value.token) return;

  if (!walletStore.ethereumAddress || !walletStore.aptosAddress) {
    notify.push({
      title: 'Connect Wallet',
      description: 'Wallet connection is required.',
      category: 'error'
    });
    return;
  }

  if (bridging.value) {
    notify.push({
      title: 'Please wait',
      description: 'Approval in progress.',
      category: 'error'
    });
    return;
  }

  bridging.value = true;

  const txHash = await bridgeToken(
    bridgeInput.value.collection,
    bridgeInput.value.token,
    walletStore.aptosAddress
  );

  if (txHash) {
    notify.push({
      title: 'Import completed',
      description: 'Transaction was sent succesfully.',
      category: 'success',
      linkTitle: 'View Trx',
      linkUrl: `https://holesky.etherscan.io/tx/${txHash}`
    });

    bridgeInput.value.collection = undefined;
    bridgeInput.value.token = undefined;
    bridgeInput.value.allowance = false;
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }

  bridging.value = false;
};

const approve = async () => {
  if (!bridgeInput.value.collection || !bridgeInput.value.token) return;

  if (!walletStore.ethereumAddress) {
    notify.push({
      title: 'Connect Wallet',
      description: 'Wallet connection is required.',
      category: 'error'
    });
    return;
  }

  if (approving.value) {
    notify.push({
      title: 'Please wait',
      description: 'Approval in progress.',
      category: 'error'
    });
    return;
  }

  approving.value = true;

  const txHash = await approveToken(
    bridgeInput.value.collection,
    bridgeInput.value.token,
    ContractID
  );

  if (txHash) {
    notify.push({
      title: 'Approval completed',
      description: 'Transaction was sent succesfully.',
      category: 'success',
      linkTitle: 'View Trx',
      linkUrl: `https://holesky.etherscan.io/tx/${txHash}`
    });

    updateApprovals();

    bridge();
  } else {
    notify.push({
      title: 'Transaction failed',
      description: 'Try again later.',
      category: 'error'
    });
  }

  approving.value = false;
};

watch(activeTab, () => {
  bridgeInput.value.collection = undefined;
  bridgeInput.value.token = undefined;
});

onMounted(() => {
  watchAccount(config, {
    onChange(account: any) {
      walletStore.setEthereumAddress(account.address);
    },
  });
});
</script>

<template>
  <main>
    <section>
      <div class="app_width">
        <header>
          <div class="logo">
            <h1>Aptos<span>PIXEL</span></h1>
          </div>

          <div class="actions">
            <button @click="modal.open()">
              {{ walletStore.ethereumAddress ? `${Converter.fineAddress(walletStore.ethereumAddress, 4)}` :
                'Wallet Connect'
              }}
            </button>
            <button @click="aptosConnect">
              {{ walletStore.aptosAddress ? `${Converter.fineAddress(walletStore.aptosAddress, 4)}` :
                'Aptos Connect'
              }}
            </button>
          </div>
        </header>
      </div>
    </section>
    <section>
      <div class="app_width">
        <div class="bridge_box">
          <div class="hero">
            <h3>Bridge your NFTs to Aptos.</h3>
          </div>

          <div class="tabs">
            <button :class="activeTab === 0 ? 'tab tab_active' : 'tab'" @click="activeTab = 0">Import</button>
            <button :class="activeTab === 1 ? 'tab tab_active' : 'tab'" @click="activeTab = 1">Redeem</button>
          </div>

          <div class="import_box" v-if="activeTab === 0">
            <div class="bridge_box_input">
              <div class="bridge_box_title">
                <p>You lock</p>

                <div class="chain">
                  <img src="/images/eth.png" alt="ethereum">
                  <p>ETH</p>
                </div>
              </div>

              <div class="bridge_nft_skin" v-if="!bridgeInput.collection">
                <div class="bridge_nft_skin_image" @click="tokenListing = true">
                  <SearchIcon />
                  <p>Pick NFT</p>
                </div>
                <div class="bridge_nft_skin_name"></div>
              </div>

              <div class="bridge_nft" v-else-if="bridgeInput.collection && bridgeInput.token">
                <img :src="bridgeInput.token.image" :alt="bridgeInput.token.name" class="bridge_nft_image">
                <p class="bridge_nft_name">{{ bridgeInput.token.name }}</p>
              </div>
            </div>

            <div class="bridge_box_input">
              <div class="bridge_box_title">
                <p>You receive</p>

                <div class="chain">
                  <img src="/images/apt.png" alt="aptos">
                  <p>APT</p>
                </div>
              </div>

              <div class="bridged_nft_skin" v-if="!bridgeInput.collection">
                <div class="bridged_nft_skin_count"></div>

                <div class="bridged_nft_info">
                  <div class="bridged_nft_skin_image"></div>
                  <div class="bridged_nft_skin_name"></div>
                </div>
              </div>

              <div class="bridged_nft" v-if="bridgeInput.collection && bridgeInput.token">
                <p class="bridged_nft_count">+1</p>

                <div class="bridged_nft_info">
                  <img :src="bridgeInput.token.image" :alt="bridgeInput.token.name" class="bridged_nft_image">
                  <p class="bridged_nft_name">{{ bridgeInput.token.name }}</p>
                </div>
              </div>
            </div>

            <div class="bridge_box_input">
              <div class="bridge_box_title">
                <p>You pay</p>

                <div class="chain">
                  <img src="/images/eth.png" alt="ethereum">
                  <p>0.00021 ETH</p>
                </div>
              </div>
            </div>

            <div class="imports" v-if="!walletStore.ethereumAddress || !walletStore.aptosAddress">
              <button @click="modal.open()" class="import">
                {{ walletStore.ethereumAddress ? `${Converter.fineAddress(walletStore.ethereumAddress, 4)}` :
                  'Wallet Connect'
                }}
              </button>
              <button @click="aptosConnect" class="import">
                {{ walletStore.aptosAddress ? `${Converter.fineAddress(walletStore.aptosAddress, 4)}` :
                  'Aptos Connect'
                }}
              </button>
            </div>

            <button class="import" v-else-if="!bridgeInput.allowance" @click="approve">{{ approving ? 'Approving..' :
              'Approve '
              }}</button>

            <button v-else class="import" @click="bridge">{{ bridging ? 'Importing..' : 'Import NFT' }}</button>
          </div>

          <div class="redeem_box" v-else>
            <div class="bridge_box_input">
              <div class="bridge_box_title">
                <p>You burn</p>

                <div class="chain">
                  <img src="/images/apt.png" alt="aptos">
                  <p>APT</p>
                </div>
              </div>

              <div class="bridge_nft_skin" v-if="!bridgeInput.collection">
                <div class="bridge_nft_skin_image" @click="tokenListing = true">
                  <SearchIcon />
                  <p>Pick NFT</p>
                </div>
                <div class="bridge_nft_skin_name"></div>
              </div>

              <div class="bridge_nft" v-if="bridgeInput.collection && bridgeInput.token">
                <img :src="bridgeInput.token.image" :alt="bridgeInput.token.name" class="bridge_nft_image">
                <p class="bridge_nft_name">{{ bridgeInput.token.name }}</p>
              </div>
            </div>

            <div class="bridge_box_input">
              <div class="bridge_box_title">
                <p>You unlock</p>

                <div class="chain">
                  <img src="/images/eth.png" alt="ethereum">
                  <p>ETH</p>
                </div>
              </div>

              <div class="bridged_nft_skin" v-if="!bridgeInput.collection">
                <div class="bridged_nft_skin_count"></div>

                <div class="bridged_nft_info">
                  <div class="bridged_nft_skin_image"></div>
                  <div class="bridged_nft_skin_name"></div>
                </div>
              </div>

              <div class="bridged_nft" v-if="bridgeInput.collection && bridgeInput.token">
                <p class="bridged_nft_count">+1</p>

                <div class="bridged_nft_info">
                  <img :src="bridgeInput.token.image" :alt="bridgeInput.token.name" class="bridged_nft_image">
                  <p class="bridged_nft_name">{{ bridgeInput.token.name }}</p>
                </div>
              </div>
            </div>

            <div class="bridge_box_input">
              <div class="bridge_box_title">
                <p>You pay</p>

                <div class="chain">
                  <img src="/images/apt.png" alt="aptos">
                  <p>0.35 APT</p>
                </div>
              </div>
            </div>

            <button class="import">Redeem NFT</button>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="marquee">
        <div class="marqueeone">
          <img src="/images/nft1.webp" alt="">
          <img src="/images/nft2.webp" alt="">
          <img src="/images/nft3.avif" alt="">
        </div>
        <div class="marqueetwo">
          <img src="/images/nft1.webp" alt="">
          <img src="/images/nft2.webp" alt="">
          <img src="/images/nft3.avif" alt="">
        </div>
        <div class="marqueethree">
          <img src="/images/nft1.webp" alt="">
          <img src="/images/nft2.webp" alt="">
          <img src="/images/nft3.avif" alt="">
        </div>
        <div class="marqueefour">
          <img src="/images/nft1.webp" alt="">
          <img src="/images/nft2.webp" alt="">
          <img src="/images/nft3.avif" alt="">
        </div>
      </div>
    </section>

    <SnackbarPop />
    <TokenList v-if="tokenListing" :chain-id="activeTab === 0 ? HOLESKY_ID : APTOS_ID"
      @on-token-changed="onTokenChanged" @close="tokenListing = false" />
  </main>
</template>

<style scoped>
header {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.logo h1 {
  font-family: "Pixelify Sans", sans-serif;
  color: var(--tx-normal);
  font-size: 40px;
}

.logo span {
  font-family: "Pixelify Sans", sans-serif;
  font-size: 50px;
}

.actions {
  display: flex;
  gap: 20px;
}

.actions button {
  height: 50px;
  font-size: 16px;
  padding: 0 20px;
  background: var(--tx-normal);
  color: var(--tx-button);
  border: none;
  font-weight: 600;
  box-shadow: 4px 4px 0 -1px #051419,
    4px 4px 0 0 #82959b;
}

.import_box,
.redeem_box {
  width: 420px;
  max-width: 100%;
}

.hero {
  text-align: center;
  padding-top: 20px;
  width: 500px;
  max-width: 100%;
}

.hero h3 {
  font-size: 40px;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-image: radial-gradient(circle at 100% 20%, #c97e64 0, #d8a679 8%, #97d9d7 70%, #e99e52 110%);
  font-weight: 500;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 420px;
  max-width: 100%;
  margin-top: 20px;
}

.tab {
  height: 60px;
  width: 50%;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--tx-dimmed);
  font-weight: 500;
  font-size: 16px;
}

.tab_active {
  color: var(--tx-normal);
  border-bottom: 2px solid var(--primary);
}

.bridge_box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bridge_box_input {
  background: var(--bg-light);
  padding: 20px;
  margin-top: 10px;
}

.bridge_box_title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bridge_box_title>p {
  color: var(--tx-normal);
  font-size: 14px;
  font-weight: 500;
}

.chain {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chain img {
  width: 20px;
  height: 20px;
  border-radius: 8px;
  object-fit: cover;
}

.chain p {
  color: var(--tx-dimmed);
  font-size: 14px;
  font-weight: 500;
}

.bridge_nft,
.bridge_nft_skin {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.bridge_nft_skin {
  cursor: pointer;
}

.bridge_nft_image {
  width: 180px;
  height: 200px;
  object-fit: cover;
}

.bridge_nft_skin_image {
  width: 180px;
  height: 200px;
  border-image: linear-gradient(45deg, #c464c982, #b6c98c8a);
  border-width: 1px;
  border-style: solid;
  border-image-slice: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-direction: column;
}

.bridge_nft_skin_image p {
  font-size: 14px;
  color: var(--tx-dimmed);
  font-weight: 500;
}

.bridge_nft_name {
  font-size: 14px;
  color: var(--tx-normal);
}

.bridge_nft_skin_name {
  height: 16px;
  width: 200px;
  border-image: linear-gradient(45deg, #c464c982, #b6c98c8a);
  border-width: 1px;
  border-style: solid;
  border-image-slice: 1;
}

.bridged_nft,
.bridged_nft_skin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
}

.bridged_nft_info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bridged_nft_image {
  width: 22px;
  height: 26px;
  object-fit: cover;
}

.bridged_nft_skin_image {
  width: 22px;
  height: 26px;
  border-image: linear-gradient(45deg, #64c96c6c, #c9a88c6e);
  border-width: 1px;
  border-style: solid;
  border-image-slice: 1;
}

.bridged_nft_count {
  font-size: 20px;
  font-weight: 500;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-image: radial-gradient(circle at 100% 20%, #c97e64 0, #d8a679 8%, #97d9d7 70%, #e99e52 110%);
}

.bridged_nft_skin_count {
  height: 24px;
  width: 16px;
  border-image: linear-gradient(45deg, #64c96c6c, #c9a88c6e);
  border-width: 1px;
  border-style: solid;
  border-image-slice: 1;
}

.bridged_nft_name {
  font-size: 14px;
  color: var(--tx-normal);
}

.bridged_nft_skin_name {
  height: 16px;
  width: 160px;
  border-image: linear-gradient(45deg, #64c96c6c, #c9a88c6e);
  border-width: 1px;
  border-style: solid;
  border-image-slice: 1;
}

.imports {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.import {
  margin-top: 20px;
  width: 100%;
  height: 50px;
  background: var(--tx-normal);
  border: none;
  color: var(--tx-button);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 4px 4px 0 -1px #051419,
    4px 4px 0 0 #82959b;
  margin-bottom: 20px;
}

.marquee {
  width: 100%;
  margin: 40vh 0;
  height: 200px;
  overflow: hidden;
  position: relative;
}

/* would need to be adjusted depending on time */
.marquee .marqueeone {
  animation: marquee 10s linear infinite;
}

.marquee .marqueetwo {
  animation: marquee 10s linear 2.5s infinite;
}

.marquee .marqueethree {
  animation: marquee 10s linear 5s infinite;
}

.marquee .marqueefour {
  animation: marquee 10s linear 7.5s infinite;
}

/* even out the elements */
.marquee div {
  padding-right: 100px;
  position: absolute;
  left: 100%;
  height: 200px;
  display: flex;
  gap: 100px;
  width: 100%;
}

.marquee img {
  width: 160px;
  height: 200px;
  object-fit: cover;
  filter: grayscale(100%);
}

.marquee:hover div {
  animation-play-state: paused;
}

/* add delay at the end of animation so you dont start while another div is going */
@keyframes marquee {
  0% {
    left: 100%;
  }

  50% {
    left: -100%;
  }

  100% {
    left: -100%
  }
}

@media screen and (max-width: 768px) {
  .logo h1 {
    font-size: 20px;
  }

  .logo span {
    font-size: 30px;
  }

  .actions button {
    height: 40px;
    padding: 0 16px;
  }

  .tab {
    height: 40px;
    font-size: 14px;
    border-width: 1px;
  }

  .hero h3 {
    font-size: 30px;
  }

  .marquee {
    margin: 30vh 0;
  }

  .marquee img {
    width: 80px;
    height: 100px;
  }

  .marquee div {
    padding-right: 50px;
    gap: 50px;
  }
}
</style>