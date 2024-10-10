import { GoldRushClient } from "@covalenthq/client-sdk";
import type { Token } from "./types";

async function getTokens(address: string, collection: string): Promise<Token[] | null> {
    try {
        const client = new GoldRushClient(import.meta.env.VITE_COVALENT_API_KEY);

        const response = await client.NftService.getNftsForAddress(
            "eth-holesky",
            address,
            { withUncached: true }
        );

        if (!response.data || !response.data.items) { return null; }

        const data = response.data.items
            .filter(item => item.contract_address?.toLowerCase() == collection.toLowerCase())
        [0].nft_data;

        if (!data) { return null; }

        return data.map((item) => {
            return {
                name: JSON.parse(item.token_url || '{}').name,
                description: JSON.parse(item.token_url || '{}').description,
                image: JSON.parse(item.token_url || '{}').image,
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