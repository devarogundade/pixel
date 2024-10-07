import Web3 from 'web3';

import ethPixelABI from "../abis/ethereum/pixel.json";

const SELOPIA_RPC = "";

async function reviveTokenOnETH(
    toContractId: string,
    token: string,
    tokenId: number,
    receiver: string
): Promise<string | null> {
    const web3 = new Web3(SELOPIA_RPC);
    const pixel = new web3.eth.Contract(ethPixelABI as any, toContractId);

    // create signer object from private key.
    const ethSigner = web3.eth.accounts.privateKeyToAccount(
        process.env.ETHEREUM_PRIVATE_KEY!!
    );

    // add signer to web3.
    web3.eth.accounts.wallet.add(ethSigner);

    try {
        // estimate base eth gas fee.
        const gas = await pixel.methods.revive(
            token,
            tokenId,
            receiver
        ).estimateGas({ from: ethSigner.address });

        // get base eth gas price.
        const gasPrice = await web3.eth.getGasPrice();

        // call the transaction.
        const { transactionHash } = await pixel.methods.revive(
            token,
            tokenId,
            receiver
        ).send({
            from: ethSigner.address,
            gasPrice: gasPrice.toString(),
            gas: gas.toString()
        });

        return transactionHash;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export {
    reviveTokenOnETH
};