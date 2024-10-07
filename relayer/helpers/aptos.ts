import {
    Account,
    Aptos,
    AptosConfig,
    Network
} from "@aptos-labs/ts-sdk";

import { AptosPaylaod } from './types';

function parsePayload(hexPayload: string): AptosPaylaod {
    return {
        toContractId: hexPayload.slice(0, 64),
        token: hexPayload.slice(64, 128),
        tokenId: parseInt(hexPayload.slice(128, 130)),
        receiver: hexPayload.slice(130, 192)
    };
}

async function mintTokenOnAptos(
    toContractId: string,
    source_erc721_address: string,
    collection: string,
    collection_description: string,
    collection_uri: string,
    token_name: string,
    token_decription: string,
    token_uri: string,
    token_id: number,
    receiver: string
): Promise<string | null> {
    try {
        const signer = Account.fromDerivationPath({
            path: process.env.APTOS_MNEMONIC_PATH!!,
            mnemonic: process.env.APTOS_MNEMONIC!!
        });

        const config = new AptosConfig({ network: Network.TESTNET });

        const aptos = new Aptos(config);

        const transaction = await aptos.transaction.build.simple({
            sender: signer.accountAddress,
            data: {
                function: `${toContractId}::pixel::mint_token`,
                functionArguments: [
                    source_erc721_address,
                    collection,
                    collection_description,
                    collection_uri,
                    token_name,
                    token_decription,
                    token_uri,
                    token_id,
                    receiver
                ]
            },
        });

        const { hash } = await aptos.signAndSubmitTransaction({ signer, transaction });

        return hash;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export {
    parsePayload,
    mintTokenOnAptos
};