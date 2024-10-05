import { Network } from "@aptos-labs/ts-sdk";
import { AptosConnectWallet } from "@aptos-connect/wallet-adapter-plugin";
import { sepolia } from '@wagmi/core/chains';
import { walletConnect } from '@wagmi/connectors';
import { defaultWagmiConfig } from '@web3modal/wagmi';

export const aptosConnectWallet = new AptosConnectWallet({
    network: Network.TESTNET,
    dappId: import.meta.env.VITE_APTOS_DAPP_ID,
    dappName: 'Pixel'
});

const metadata = {
    name: 'AptosPIXEL',
    description: 'Cross-chain swap aggregator.',
    url: 'https://aptospixel.netlify.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const chains = [sepolia];

export const config = defaultWagmiConfig({
    // @ts-ignore
    chains, projectId: import.meta.env.VITE_PROJECT_ID, metadata, connectors: [walletConnect({
        projectId: import.meta.env.VITE_PROJECT_ID
    })]
});