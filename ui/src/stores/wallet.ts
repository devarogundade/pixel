import { defineStore } from 'pinia';

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    aptosAddress: null as string | null,
    ethereumAddress: null as string | null
  }),
  actions: {
    setAptosAddress(newAddress: string | null) {
      if (!newAddress) {
        this.aptosAddress = null;
        return;
      }
      this.aptosAddress = newAddress;
    },
    setEthereumAddress(newAddress: string | null) {
      if (!newAddress) {
        this.ethereumAddress = null;
        return;
      }
      this.ethereumAddress = newAddress;
    }
  }
});
