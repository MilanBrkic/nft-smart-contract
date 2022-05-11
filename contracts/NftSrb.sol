//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract NftSrb is ERC721URIStorage {
    constructor() ERC721('NftSrbija', 'NFTSRB') {
        contractOwner = payable(msg.sender);
    }

    uint256 private counter = 0;
    address payable contractOwner;
    mapping(uint256 => uint256) private prices;
    mapping(uint256 => bool) private forSale;

    event Mint(uint256 _tokenId, address minter);

    function mint(string memory tokenURI, uint256 price) public {
        _safeMint(msg.sender, counter);
        _setTokenURI(counter, tokenURI);
        prices[counter] = price;
        forSale[counter] = true;
        emit Mint(counter++, msg.sender);
    }

    function updateForSale(
        uint256 tokenId,
        bool _isForSale,
        uint256 price
    ) public {
        address owner = ownerOf(tokenId);
        require(owner == msg.sender, 'Error, non owner has requested price change');

        forSale[tokenId] = _isForSale;
        if (_isForSale) {
            prices[tokenId] = price;
        }
    }

    function getPrice(uint256 tokenId) public view returns (uint256) {
        return prices[tokenId];
    }

    function isForSale(uint256 tokenId) public view returns (bool) {
        return forSale[tokenId];
    }

    function buy(uint256 tokenId) public payable {
        require(forSale[tokenId] == true, 'Error, token not for sale');
        require(msg.value >= prices[tokenId], 'Error, value paid does not match the price');
        require(msg.sender.balance >= msg.value, 'Error, insufficient balance');

        address from = ownerOf(tokenId);
        require(from != msg.sender, "Error, owner can't send token to himself");

        _transfer(from, msg.sender, tokenId);
        forSale[tokenId] = false;

        uint256 forContractOwner = (msg.value * 5) / 100;
        uint256 forTokenOwner = msg.value - forContractOwner;

        contractOwner.transfer(forContractOwner);
        payable(from).transfer(forTokenOwner);
    }
}
