module pixel::pixel {
    use std::signer;
    use std::vector;
    use std::option;
    use std::bcs;
    use std::string::{Self, String};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_token_objects::collection;
    use aptos_token_objects::token::{Self, Token, BurnRef};   
    use aptos_std::table::{Self, Table};
    use wormhole::wormhole;    
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{AptosCoin};

    // Error codes to handle common errors.
    const E_NOT_ALLOWED: u64 = 500; // Error for unauthorized actions (sender not the token owner).
    const E_NOT_MINTED: u64 = 501;  // Error for when a token has not been minted on Aptos.

    // Constant representing the Ethereum chain ID.
    const ETHEREUM_CHAIN_ID: u16 = 2;

    // Struct representing the ERC721 contract on Aptos.
    // This stores the collection's metadata and tracks whether specific tokens have been minted.
    struct ERC721 has key {
        name: String,                          // Name of the ERC721 collection.
        symbol: String,                        // Symbol representing the collection.
        token_addresses: Table<address, bool>, // A table mapping token addresses to a boolean indicating if the token has been minted on Aptos.
        source_erc721_address: vector<u8>      // The original address of the ERC721 contract on Ethereum.
    }

    // Struct that tracks the burn reference and original token ID for tokens bridged from Ethereum.
    struct TokenController has key {
        burn_ref: BurnRef,   // Reference used to burn tokens on Aptos.
        source_token_id: u64 // The ID of the original token on Ethereum.
    }

    // Struct representing the module's global state.
    // Contains key information needed for minting, burning, and cross-chain messaging.
    struct State has key {
        signer_cap: SignerCapability,                // Capability used to sign transactions and create new accounts.
        emitter_cap: wormhole::emitter::EmitterCapability, // Capability required to emit cross-chain messages through Wormhole.
        wormhole_nonce: u64,                         // Nonce used to ensure unique Wormhole messages (helps with message ordering).
        relayer: address,                            // The address of the authorized entity (relayer) that can initiate cross-chain actions.
        peer_contracts: Table<u16, vector<u8>>       // A table mapping chain IDs to peer contract addresses on those chains.
    }

    // Initialization function that sets up the module's state by creating a resource account and registering a Wormhole emitter.
    // This should be called once during deployment to initialize the module's key components.
    fun init_module(pixel: &signer) {
        // Create a resource account to hold the State struct.
        let (_, res_signer_cap) = account::create_resource_account(pixel, b"State");

        // Register the contract as a Wormhole emitter, allowing it to send cross-chain messages.
        let emitter_cap = wormhole::register_emitter();

        // Initialize the State struct with a default Wormhole nonce and an empty table for peer contracts.
        let state = State {
            signer_cap: res_signer_cap,           // The account used for signing actions.
            emitter_cap: emitter_cap,             // Wormhole emitter capability.
            wormhole_nonce: 1,                    // Initial nonce for Wormhole messages.
            relayer: @relayer,                    // Address of the authorized relayer.
            peer_contracts: table::new()          // Table to hold peer contract addresses for different chains.
        };

        // Move the initialized state into storage.
        move_to(pixel, state);
    }

    // Entry function that burns a token on Aptos and triggers a cross-chain redemption process to mint the corresponding token on Ethereum.
    public entry fun redeem(
        sender: &signer,
        token: Object<Token>,
        erc721_address: address,
        token_controller_address: address,
        receiver: address
    ) acquires State, ERC721, TokenController {
        // Retrieve the address of the token.
        let token_address = object::object_address(&token);
        
        // Ensure the sender is the owner of the token.
        assert!(object::owner(token) == signer::address_of(sender), E_NOT_ALLOWED);

        // Retrieve the ERC721 contract on Aptos and verify if the token has been minted.
        let erc721 = borrow_global_mut<ERC721>(erc721_address);
        let was_minted = *table::borrow(&erc721.token_addresses, token_address);
        assert!(was_minted, E_NOT_MINTED);        

        // Mark the token as no longer minted on Aptos.
        table::upsert(&mut erc721.token_addresses, token_address, false);
        
        // Retrieve the TokenController and burn the token on Aptos.
        let token_controller = borrow_global<TokenController>(token_controller_address);
        token::burn(token_controller.burn_ref);

        // Initiate the cross-chain redemption process to mint the corresponding token on Ethereum.
        redeem_token_on_ethereum(
            sender,
            receiver,
            erc721.source_erc721_address,
            token_controller.source_token_id
        );
    }

    // Internal function that handles the actual cross-chain redemption process via Wormhole.
    // It constructs a payload with necessary information and sends a message to the target chain (Ethereum).
    fun redeem_token_on_ethereum(
        sender: &signer,
        receiver: address,
        source_erc721_address: vector<u8>,
        source_token_id: u64
    ) acquires State {
        // Retrieve the current state.
        let state = borrow_global_mut<State>(@pixel);
        
        // Get the message fee for Wormhole cross-chain transactions and withdraw the appropriate amount of AptosCoin from the sender.
        let message_fee = wormhole::state::get_message_fee();
        let fee_coins = coin::withdraw<AptosCoin>(sender, message_fee);

        // Retrieve the target contract address on Ethereum from the peer contracts table.
        let to_contract_id = *table::borrow(&state.peer_contracts, ETHEREUM_CHAIN_ID);

        // Construct the payload for the cross-chain message.
        let payload = vector::empty<u8>(); 
        vector::append(&mut payload, to_contract_id);                // Ethereum contract address.
        vector::append(&mut payload, source_erc721_address);         // Source ERC721 contract address on Ethereum.
        vector::append(&mut payload, bcs::to_bytes(&source_token_id)); // Source token ID on Ethereum.
        vector::append(&mut payload, bcs::to_bytes(&receiver));        // Address of the receiver on Ethereum.

        // Publish the message using Wormhole, sending the payload to Ethereum.
        wormhole::publish_message(
            &mut state.emitter_cap,
            state.wormhole_nonce,
            payload,
            fee_coins
        );

        // Increment the Wormhole nonce to ensure unique future messages.
        state.wormhole_nonce = state.wormhole_nonce + 1;
    }

    // Entry function to mint an Aptos-based token corresponding to an ERC721 token on Ethereum.
    public entry fun mint_token(
        sender: &signer,
        source_erc721_address: vector<u8>,
        collection: String,
        collection_description: String,
        collection_uri: String,
        token_name: String,
        token_decription: String,
        token_uri: String,
        token_id: u64,
        receiver: address
    ) acquires State, ERC721 {
        // Ensure that only the authorized relayer can mint tokens on Aptos.
        only_owner(sender);
        
        // Retrieve the current state.
        let state = borrow_global<State>(@pixel);
        let state_signer = account::create_signer_with_capability(&state.signer_cap);
        
        // Create a resource account for the ERC721 collection on Aptos, if it doesn't already exist.
        let (erc721_signer,_) = account::create_resource_account(&state_signer, source_erc721_address);
        let erc721_signer_address = signer::address_of(&erc721_signer);

        // If the ERC721 collection hasn't been created yet, initialize it and create a collection on Aptos.
        if (!exists<ERC721>(erc721_signer_address)) {
            move_to(&erc721_signer, ERC721 {
                name: collection,
                symbol: collection_description,
                token_addresses: table::new(),
                source_erc721_address: source_erc721_address
            });

            collection::create_unlimited_collection(
                &state_signer,
                collection_description,
                collection,
                option::none(),
                collection_uri
            );
        };

        // Mint the token on Aptos.
        let constructor_ref = token::create_named_token(
            &state_signer,
            collection,
            token_decription,
            token_name,
            option::none(),
            token_uri
        );

        // Generate a burn reference for the minted token.
        let burn_ref = token::generate_burn_ref(&constructor_ref);

        // Create a TokenController to track the token's burn reference and original Ethereum token ID.
        let token_controller_signer = object::generate_signer(&constructor_ref);
        move_to(&token_controller_signer, TokenController {
            burn_ref: burn_ref,
            source_token_id: token_id
        });

        // Retrieve the token's address and mark it as minted in the ERC721 collection.
        let token_address = signer::address_of(&token_controller_signer);
        let erc721 = borrow_global_mut<ERC721>(erc721_signer_address);
        table::upsert(&mut erc721.token_addresses, token_address, true);

        let token_obj = object::address_to_object<Token>(token_address);

        // Transfer the minted token to the receiver's account.
        object::transfer(&state_signer, token_obj, receiver);
    }

    // Helper function to ensure that the action is performed by the authorized relayer.
    fun only_owner(sender: &signer) acquires State {
        let state = borrow_global<State>(@pixel);
        assert!(signer::address_of(sender) == state.relayer, E_NOT_ALLOWED);
    }
}
