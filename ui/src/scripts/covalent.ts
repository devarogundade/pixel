import { GoldRushClient } from "@covalenthq/client-sdk";
import type { Token } from "./types";

async function getTokens(address: string, collection: string): Promise<Token[] | null> {
    try {
        const client = new GoldRushClient(import.meta.env.VITE_COVALENT_API_KEY);
        const response = await client.NftService.checkOwnershipInNft(
            "eth-holesky",
            address,
            collection
        );

        if (!response.data || !response.data.items) { return null; }

        return response.data.items.map((item) => {
            return {
                name: item.nft_data?.external_data?.name || 'Unkwown',
                description: item.nft_data?.external_data?.description || 'Unkwown',
                image: item.nft_data?.external_data?.image,
                tokenId: String(item.token_id)
            };
        });
    } catch (error) {
        console.log(error);
        return null;
    }
};

export {
    getTokens
};