import type { Collection } from "./types";

export const tokens: Collection[] = [
    {
        name: "Bored Ape Yatch Club",
        symbol: "BAYC",
        image: "/images/bayc.png",
        addresses: {
            10006: "0x626e574E9AE8860fF123458d4a38f1B9844FE9C1",
            22: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        }
    },
    {
        name: "CryptoPunks",
        symbol: "PUNKS",
        image: "/images/punks.png",
        addresses: {
            10006: "0x9A19e8574668dca5C4750eB642C614b7e5836cF4",
            22: "0x14E0826c58f9C2a3a1B46b51F6d4705bCf0d6a22"
        }
    }
];

export const popularCollection = (chainId: number): Collection[] => {
    return tokens.filter((t) => t.addresses[chainId]?.startsWith(
        '0x'
    )).splice(0);
};

export const getToken = (symbol: string): Collection | undefined => {
    return tokens.find((t) => t.symbol.toLowerCase() == symbol.toLowerCase());
};

export const findChainTokens = (chainId: number): Collection[] => {
    return tokens.filter((t) => t.addresses[chainId]?.startsWith(
        '0x'
    ));
};

export const findCollectionsByNameOrAddress = (value: string, chainId: number): Collection[] => {
    if (value.length == 0) {
        return tokens.filter((t) => t.addresses[chainId]?.startsWith(
            '0x'
        ));
    }

    return tokens.filter((t) => t.name.replace(" ", "").toLowerCase().includes(
        value.replace(" ", "").toLowerCase()) ||
        t.addresses[chainId]?.toLowerCase() == value.toLowerCase()
    );
};