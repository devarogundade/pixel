// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {BaseMockToken} from "./BaseMockToken.sol";

contract BAYC is BaseMockToken {
    constructor() BaseMockToken("Bored Ape Yatch Club", "BAYC") {}
}
