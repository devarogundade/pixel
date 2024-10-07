// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract BaseMockToken is ERC721 {
    // Mapping to store the token URIs (metadata) for each tokenId
    mapping(uint256 => string) internal _tokenURIs;

    // Counter to keep track of the token IDs for minting new tokens
    uint256 private _tokenIdCounter;

    // Constructor to initialize the ERC721 token with a name and symbol
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    /**
     * @dev Function to mint a new NFT with metadata (name, description, image).
     * @param name The name of the NFT.
     * @param description A description of the NFT.
     * @param image The URL of the NFT image.
     */
    function mint(
        string memory name,
        string memory description,
        string memory image
    ) external {
        // Use the current tokenIdCounter as the new token ID
        uint256 tokenId = _tokenIdCounter;

        // Safely mint the new token to the msg.sender (the function caller)
        _safeMint(msg.sender, tokenId);

        // Construct the metadata as a JSON string and store it in the _tokenURIs mapping
        _tokenURIs[tokenId] = string(
            abi.encodePacked(
                '{"name": "',
                name,
                '", "description": "',
                description,
                '", "image": "',
                image,
                '"}'
            )
        );

        // Increment the tokenIdCounter for the next token to be minted
        _tokenIdCounter++;
    }

    /**
     * @dev Function to retrieve the metadata URI of a given token.
     * @param tokenId The ID of the token whose URI is being queried.
     * @return The metadata URI of the token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        // Ensure the token exists before fetching its URI
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        // Return the stored metadata (URI) for the given token ID
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Checks if a token exists by confirming the ownership of the token.
     * @param tokenId The ID of the token to check.
     * @return bool True if the token exists, false otherwise.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        // A token exists if its owner is not the zero address
        return _ownerOf(tokenId) != address(0);
    }
}
