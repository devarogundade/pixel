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
};

export type Token = {
    name: string;
    image: string;
    tokenId: string;
};