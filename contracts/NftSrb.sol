//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NftSrb is ERC721{
    constructor() ERC721("NftSrbija", "NFTSRB") {}
    uint256 public _counter = 0;

    function mint(bytes memory data) public{
        _safeMint(msg.sender, _counter++, data);
    }
}