import { config, HOLESKY_ID } from "./connect";
import type { Token, Collection } from "./types";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { abi as pixelAbi } from '@/abis/pixel';

export const ContractID = "0xC7Cd3F55b10b6385B9230BC4e8BF4f38010C13c6";

export async function bridgeToken(
    collection: Collection,
    token: Token,
    receiver: string
): Promise<`0x${string}` | null> {
    try {
        const result = await writeContract(config, {
            abi: pixelAbi,
            address: ContractID,
            functionName: 'transfer',
            args: [
                collection.addresses[HOLESKY_ID],
                BigInt(token.tokenId),
                receiver
            ],
            value: BigInt(0)
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);
        return null;
    }
}