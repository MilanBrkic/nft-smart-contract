//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract NftSrb is ERC721URIStorage {
    constructor() ERC721('NftSrbija', 'NFTSRB') {
        contractOwner = msg.sender;
    }

    uint256 public counter = 0;
    address contractOwner;
    mapping(uint256 => address) public owners;

    event Mint(uint256 _tokenId, address minter);

    function mint(string memory tokenURI) public {
        _safeMint(msg.sender, counter);
        _setTokenURI(counter, tokenURI);
        if (msg.sender != contractOwner) {
            approve(contractOwner, counter);
        }
        owners[counter] = msg.sender;
        emit Mint(counter++, msg.sender);
    }

    function transfer(address to, uint256 tokenId) public {
        address from = ownerOf(tokenId);
        transferFrom(from, to, tokenId);
        owners[tokenId] = to;
    }

    function getAllByAddress() public view returns (uint256[] memory) {
        uint256 numberOfTokens = balanceOf(msg.sender);
        uint256[] memory userTokens = new uint256[](numberOfTokens);
        uint256 userCounter = 0;
        for (uint256 i = 0; i < counter; i++) {
            if (owners[i] == msg.sender) {
                userTokens[userCounter++] = i;
            }
        }
        return userTokens;
    }
}
