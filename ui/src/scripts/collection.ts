import type { Collection } from "./types";

export const tokens: Collection[] = [
    {
        name: "Bored Ape Yatch Club",
        symbol: "BAYC",
        image: "/images/bayc.png",
        addresses: {
            10006: "0x626e574E9AE8860fF123458d4a38f1B9844FE9C1",
            22: "0xf78a0787746f607fa9d0fcfe842dbeee85b70466e3551c17628e3d68b276027b",
        },
        aptosErc721: "0x698d5a76b1fd3e3f0361f732d50439f31aa7be8318b3adea31f10451ae3b7ec4"
    },
    {
        name: "CryptoPunks",
        symbol: "PUNKS",
        image: "/images/punks.png",
        addresses: {
            10006: "0x9A19e8574668dca5C4750eB642C614b7e5836cF4",
            22: "0xaa45830fb72eae8ee1beb7bebd5b10935ce36066cbb79bf697f7e9c188ab5abf"
        },
        aptosErc721: "0x25a4fc3208d081d71bf41f04a1e3e54404d3c16c9ff99c797718b6462c76b2f0"
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