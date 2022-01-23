//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftSrb is ERC721URIStorage{
    constructor() ERC721("NftSrbija", "NFTSRB") {}
    uint256 private _counter = 0;

    function mint(string memory tokenURI) public{
        _safeMint(msg.sender, _counter);
        _setTokenURI(_counter, tokenURI);
        _counter++;
    }
}