//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NftSrb is ERC721URIStorage{
    constructor() ERC721("NftSrbija", "NFTSRB") {}
    uint256 public counter = 0;
    mapping(uint256 => address) public owners;

    event Mint(uint256 _tokenId, address minter);

    function mint(string memory tokenURI) public{
        _safeMint(msg.sender, counter);
        _setTokenURI(counter, tokenURI);
        owners[counter] = msg.sender;
        emit Mint(counter++, msg.sender);
    }

    function getAllByAddress(address userAddress) public view returns(uint[] memory){
        uint numberOfTokens = balanceOf(userAddress);
        uint[] memory userTokens = new uint[](numberOfTokens);
        uint userCounter = 0;
        for(uint256 i = 0;i<counter;i++){
            if(owners[i]==userAddress){
                userTokens[userCounter++] = i; 
            }
        }
        return userTokens;
    }
}