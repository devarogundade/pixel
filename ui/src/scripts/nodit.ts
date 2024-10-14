import type { CurrentTokenOwnershipV2, Token } from "./types";
import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_NODIT_URL_KEY
});

export async function getTokens(address: string, collection: string): Promise<Token[] | null> {
    try {
        const response = await client.post('/', {
            query: `{
                current_token_ownerships_v2(
                    where: {owner_address: {_eq: "${address}"}, current_token_data: {collection_id: {_eq: "${collection}"}}},
                    order_by: {amount: desc}
                ) {
                    current_token_data {
                        token_name
                        description
                        token_uri
                        token_data_id
                    }
                }
            }`
        });

        const tokens = response.data.data.current_token_ownerships_v2 as CurrentTokenOwnershipV2[];

        return tokens.map(token => {
            return {
                name: token.current_token_data.token_name,
                description: token.current_token_data.description,
                image: token.current_token_data.token_uri,
                tokenId: token.current_token_data.token_data_id
            };
        });
    } catch (error) {
        console.log(error);
        return null;
    }
}