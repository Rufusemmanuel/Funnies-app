// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title Funnies Airdrop
 * @notice Simple gated ERC-721 drop with one claim per address.
 */
contract FunniesAirdrop is ERC721URIStorage {
    uint256 private _nextTokenId = 1;
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public mintedTokenId;
    mapping(address => string) public mintedTokenUri;

    constructor() ERC721("Funnies Airdrop", "FUNNY") {}

    /**
     * @notice Mints one NFT to `to` with a provided token URI.
     * @dev Public claim; each address can only receive one mint. Caller must be the recipient.
     */
    function safeMint(address to, string memory uri) external {
        require(msg.sender == to, "Claim for self only");
        require(!hasClaimed[to], "Already claimed");
        uint256 tokenId = _nextTokenId++;
        hasClaimed[to] = true;
        mintedTokenId[to] = tokenId;
        mintedTokenUri[to] = uri;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function getMinted(address user) external view returns (bool claimed, uint256 tokenId, string memory uri) {
        claimed = hasClaimed[user];
        tokenId = mintedTokenId[user];
        uri = mintedTokenUri[user];
    }
}
