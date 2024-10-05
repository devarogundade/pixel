// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// Import OpenZeppelin's Ownable contract to restrict function access to the owner
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
// Import ERC721 interface for interacting with NFTs
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

// Import Wormhole SDK interface for cross-chain communication
import {IWormhole} from "wormhole-solidity-sdk/interfaces/IWormhole.sol";

// Import a library to convert addresses to bytes32 for Wormhole's cross-chain messaging
import {AddressToBytes32} from "./libraries/AddressToBytes32.sol";

/// @title Pixel
/// @notice This contract handles cross-chain NFT transfers using the Wormhole protocol.
/// @dev The contract supports sending NFTs to the Aptos Chain by minting the corresponding asset on that chain.
contract Pixel is Ownable {
    using AddressToBytes32 for bytes32;
    using AddressToBytes32 for address;

    // Reference to Wormhole for cross-chain messaging
    IWormhole internal immutable _wormhole;

    // Consistency level for Wormhole messaging, used to adjust reliability across chains
    uint8 internal constant CONSISTENCY_LEVEL = 0;

    // Nonce for keeping track of message order in Wormhole transactions
    uint32 public _wormholeNonce = 1;

    // Mapping to track peered contracts on other chains by their chain ID
    mapping(uint16 => bytes32) internal _peerContracts;

    // Chain ID for the Aptos chain (can be updated as necessary)
    uint16 public APTOS_CHAIN_ID = 22;

    /// @param relayer Address of the relayer responsible for facilitating cross-chain transactions
    /// @param wormhole Address of the Wormhole contract to interact with the cross-chain messaging protocol
    constructor(address relayer, address wormhole) Ownable(relayer) {
        _wormhole = IWormhole(wormhole);
    }

    /// @notice Transfers an NFT from the current chain to the Aptos chain by locking it in this contract and minting the corresponding NFT on Aptos.
    /// @dev The function locks the NFT on the source chain and initiates the process for cross-chain minting via Wormhole.
    /// @param token The address of the ERC721 token to be transferred.
    /// @param tokenId The ID of the token being transferred.
    /// @param receiver The recipient's address on the destination chain, encoded as bytes32.
    function transfer(
        address token,
        uint256 tokenId,
        bytes32 receiver
    ) external payable {
        address sender = _msgSender();

        // Lock the NFT in this contract by transferring it from the sender to this contract
        IERC721(token).transferFrom(sender, address(this), tokenId);

        // Mint a corresponding token on the Aptos chain via Wormhole
        _mintTokenOnAptosChain(token.addressToBytes32(), tokenId, receiver);
    }

    /// @dev Internal function to mint an NFT on the Aptos chain by sending a Wormhole message.
    /// @param token The address of the token being transferred, encoded as bytes32 for Wormhole compatibility.
    /// @param tokenId The ID of the token being transferred.
    /// @param receiver The recipient's address on the Aptos chain, encoded as bytes32.
    function _mintTokenOnAptosChain(
        bytes32 token,
        uint256 tokenId,
        bytes32 receiver
    ) internal {
        // Retrieve the message fee required for sending messages via Wormhole
        uint256 wormholeFee = _wormhole.messageFee();

        // Ensure the sender has provided enough ETH to cover the Wormhole message fee
        require(msg.value >= wormholeFee, "Insufficient message fee");

        // Get the peer contract address on the Aptos chain for cross-chain minting
        bytes32 toContractId = _peerContracts[APTOS_CHAIN_ID];

        // Retrieve metadata from the ERC721 token (e.g., name, symbol, and tokenURI)
        IERC721Metadata metadata = IERC721Metadata(token.bytes32ToAddress());

        // Prepare the payload with token details and receiver information for cross-chain communication
        bytes memory payload = abi.encode(
            toContractId,
            token,
            tokenId,
            metadata.name(), // Token name
            metadata.symbol(), // Token symbol
            metadata.tokenURI(tokenId), // Metadata URI
            receiver
        );

        // Publish the message to Wormhole, triggering the cross-chain minting process
        _wormhole.publishMessage{value: wormholeFee}(
            _wormholeNonce,
            payload,
            CONSISTENCY_LEVEL
        );

        // Increment the nonce to ensure message order is maintained
        _wormholeNonce++;
    }

    /// @notice Revives an NFT by unlocking it and transferring it to the specified recipient on the source chain.
    /// @dev This function is called after the token is minted on the destination chain and is restricted to the contract owner.
    /// @param token The address of the token being revived.
    /// @param tokenId The ID of the token being revived.
    /// @param receiver The address of the recipient on the source chain, encoded as bytes32.
    function revive(
        bytes32 token,
        uint256 tokenId,
        bytes32 receiver
    ) external onlyOwner {
        // Transfer the locked NFT back to the recipient on the source chain
        IERC721(token.bytes32ToAddress()).transferFrom(
            address(this),
            receiver.bytes32ToAddress(),
            tokenId
        );
    }

    /// @notice Allows the contract owner to set peer contract addresses for specific chain IDs.
    /// @param chainId The ID of the destination chain (e.g., Aptos).
    /// @param peerContract The address of the peer contract on the destination chain, encoded as bytes32.
    function setPeerContract(
        uint16 chainId,
        bytes32 peerContract
    ) external onlyOwner {
        _peerContracts[chainId] = peerContract;
    }
}
