import * as dotenv from "dotenv";
import Web3 from 'web3';

import {
    Environment,
    StandardRelayerApp,
    StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_APTOS, CHAIN_ID_ETH } from "@certusone/wormhole-sdk";

import { extractMetadata } from './helpers/common';
import { parsePayload, mintTokenOnAptos } from './helpers/aptos';
import { reviveTokenOnETH } from './helpers/ethereum';

dotenv.config();

// ======== Pixel contract addresses ======== //
const PIXEL_APTOS = "";
const PIXEL_APTOS_EMITTER = "";
const PIXEL_ETHEREUM = "";

const DOMAIN = "https://aptospixel.netlify.app";

(async function main() {
    // initialize relayer engine app, pass relevant config options
    const app = new StandardRelayerApp<StandardRelayerContext>(
        Environment.TESTNET,
        {
            name: "PixelRelayer",
            missedVaaOptions: {
                startingSequenceConfig: {
                    '22': BigInt(1), /* aptos */
                    '1': BigInt(1) /* ethereum */
                }
            },
            spyEndpoint: process.env.SPY_HOST,
            redis: {
                host: process.env.REDIS_HOST
            }
        },
    );

    // add a filter with a callback that will be
    // invoked on finding a VAA that matches the filter
    app.multiple(
        {
            [CHAIN_ID_APTOS]: PIXEL_APTOS_EMITTER,
            [CHAIN_ID_ETH]: PIXEL_ETHEREUM
        },
        async (ctx) => {
            const vaa = ctx.vaa;

            // Check if VAA has a payload.
            if (!vaa?.payload) {
                console.log('Not payload was sent: ', vaa);
                return;
            }

            // Parse payload to HEX format.
            const hexPayload = '0x' + vaa?.payload.toString('hex');
            const sourceTxHash = ctx.sourceTxHash!;

            console.log('⚡[new vaa]: ', hexPayload);

            // Check for emitter chain.
            if (vaa?.emitterChain == CHAIN_ID_APTOS) {
                const { toContractId, token, tokenId, receiver } = parsePayload(hexPayload);

                const txHash = await reviveTokenOnETH(
                    toContractId,
                    token,
                    tokenId,
                    receiver
                );

                console.log(txHash);
            } else if (vaa?.emitterChain == CHAIN_ID_ETH) {
                const web3 = new Web3();

                const params = web3.eth.abi.decodeParameters(
                    ['bytes32', 'bytes32', 'uint256', 'string', 'string', 'string', 'bytes32'],
                    hexPayload
                );

                const toContractId = params[0];
                const source_erc721_address = params[1];
                const tokenId = params[2];
                const collection = params[3];
                const collection_description = params[4];
                const token_uri = params[5];
                const receiver = params[6];

                try {
                    const metadata = await extractMetadata(token_uri);

                    const txHash = await mintTokenOnAptos(
                        toContractId,
                        source_erc721_address,
                        collection,
                        collection_description,
                        `${DOMAIN}/${CHAIN_ID_ETH}/${source_erc721_address}`,
                        `${metadata.name} ${tokenId}`,
                        metadata.decription,
                        metadata.image,
                        tokenId,
                        receiver
                    );

                    console.log(txHash);
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log('Undefined emiitter id');
            }
        },
    );

    // add and configure any other middleware ..
    // start app, blocks until unrecoverable error or process is stopped
    await app.listen();
})();