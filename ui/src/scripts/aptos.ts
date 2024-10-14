import type { Collection, Token } from "./types";
import { APTOS_ID, aptosConnectWallet } from './connect';
import { UserResponseStatus } from '@aptos-labs/wallet-standard';

const pixelId: string = '0x61d2e34834990feeb51f6823d407a41cd7719ceb7ad49ce857b5c46e1cd4ff21';

export async function redeemToken(
    collection: Collection,
    token: Token,
    receiver: string
): Promise<string | null> {
    try {
        const response = await aptosConnectWallet.signAndSubmitTransaction({
            payload: {
                function: `${pixelId}::pixel::redeem`,
                functionArguments: [
                    token.tokenId,
                    collection.addresses[APTOS_ID],
                    token.tokenId,
                    receiver
                ]
            }
        });

        if (response.status == UserResponseStatus.APPROVED) {
            return response.args.hash;
        }

        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}
