import { config, HOLESKY_ID } from './connect';
import { waitForTransactionReceipt, getBalance, writeContract, readContract } from '@wagmi/core';
import { erc721Abi } from 'viem';
import type { Token, Collection } from './types';

export async function getAllowance(
    collection: Collection,
    token: Token,
    spender: `0x${string}`
): Promise<boolean> {
    if (!collection.addresses[HOLESKY_ID]) return false;

    try {
        const retrievedSpender = await readContract(config, {
            abi: erc721Abi,
            address: collection.addresses[HOLESKY_ID]!,
            functionName: 'getApproved',
            args: [BigInt(token.tokenId)]
        });

        return spender.toLowerCase() == retrievedSpender.toLowerCase();
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function approveToken(
    collection: Collection,
    token: Token,
    spender: `0x${string}`
): Promise<`0x${string}` | null> {
    if (!collection.addresses[HOLESKY_ID]) return null;

    try {
        const result = await writeContract(config, {
            abi: erc721Abi,
            address: collection.addresses[HOLESKY_ID],
            functionName: 'approve',
            args: [spender, BigInt(token.tokenId)]
        });

        const receipt = await waitForTransactionReceipt(config, { hash: result });

        return receipt.transactionHash;
    } catch (error) {
        console.log(error);
        return null;
    }
}