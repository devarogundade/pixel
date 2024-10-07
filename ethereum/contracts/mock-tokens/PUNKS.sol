// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {BaseMockToken} from "./BaseMockToken.sol";

contract PUNKS is BaseMockToken {
    constructor() BaseMockToken("Crypto Punks", "PUNKS") {}
}
