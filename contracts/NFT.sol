// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter public tokenCount;

    constructor() ERC721("Magic Potions", "MAGIC") {}

    /**
     * @notice Minting an NFT
     * @param _tokenURI URL containing the NFT Metadata
     */
    function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount.increment();
        uint256 newTokenId = tokenCount.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        return newTokenId;
    }
}
