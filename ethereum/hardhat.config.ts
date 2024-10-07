import { vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const MNEMONIC = vars.get("MNEMONIC");
const HOLESKY_API_KEY = vars.get("HOLESKY_API_KEY");

module.exports = {
  solidity: {
    version: "0.8.27",
  },
  networks: {
    holesky: {
      url: 'https://ethereum-holesky-rpc.publicnode.com	',
      chainId: 17000,
      accounts: {
        mnemonic: MNEMONIC
      },
    }
  },
  etherscan: {
    apiKey: {
      holesky: HOLESKY_API_KEY
    },
    customChains: [
      {
        network: 'holesky',
        chainId: 17000,
        urls: {
          apiURL: 'https://api-holesky.etherscan.io/api',
          browserURL: 'https://holesky.etherscan.io/',
        },
      }
    ],
  },
};




