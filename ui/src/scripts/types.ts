export interface Notification {
    title: string;
    description: string;
    category: string;
    linkTitle?: string;
    linkUrl?: string;
}

export type Collection = {
    name: string;
    symbol: string;
    image: string;
    addresses: { [key: number]: `0x${string}` | undefined; };
    aptosErc721: string;
};

export type Token = {
    name: string;
    image: string | undefined;
    tokenId: string;
};

export interface CurrentTokenOwnershipV2 {
    current_token_data: TokenData;
    amount: number;
}

export interface TokenData {
    collection_id: string;
    token_name: string;
    description: string;
    token_uri: string;
    token_data_id: string;
}