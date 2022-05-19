const chai = require('chai');
const { ethers } = require('hardhat');
chai.use(require('chai-as-promised'));
const { assert, expect } = chai;

describe('Nft Srbija', function () {
  let NftSrb;
  let nftsrb;
  let accounts;
  let deployedAddress;
  let alfaSigner;
  let betaSigner;
  let contractOwner;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    contractOwner = accounts[0];
    [alfaSigner, betaSigner] = [accounts[1], accounts[2]];

    NftSrb = await ethers.getContractFactory('NftSrb', contractOwner);
    nftsrb = await NftSrb.deploy();
    await nftsrb.deployed();

    deployedAddress = nftsrb.address;
  });

  it('Should fail for tokenId that does not exist', async () => {
    await expect(nftsrb.tokenURI(0)).to.be.rejectedWith();
  });

  describe('Minting process', () => {
    it('Should mint a token', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      const mintedToken = await nftsrb.connect(alfaSigner).mint(tokenUri, price);
      const balance = await nftsrb.balanceOf(alfaSigner.address);
      assert.equal(balance, 1);
      const receivedTokenUri = await nftsrb.tokenURI(0);
      const receivedPrice = await nftsrb.getPrice(0);
      const receivedForSale = await nftsrb.isForSale(0);

      assert.equal(mintedToken.from, alfaSigner.address);
      assert.equal(mintedToken.to, deployedAddress);
      assert.equal(receivedTokenUri, tokenUri);
      assert.equal(receivedPrice, price);
      assert.equal(receivedForSale, true);
    });

    it('Should mint three tokens', async () => {
      const tokens = [
        { uri: `www.${Math.floor(Math.random() * 10000)}.com`, price: 100 },
        { uri: `www.${Math.floor(Math.random() * 10000)}.com`, price: 200 },
        { uri: `www.${Math.floor(Math.random() * 10000)}.com`, price: 300 }
      ];
      for (const token of tokens) {
        await nftsrb.connect(alfaSigner).mint(token.uri, token.price);
      }

      const balance = await nftsrb.balanceOf(alfaSigner.address);

      for (let i = 0; i < tokens.length; i++) {
        const ownerAddress = await nftsrb.ownerOf(i);
        const receivedPrice = await nftsrb.getPrice(i);
        const receivedForSale = await nftsrb.isForSale(i);

        assert.equal(alfaSigner.address, ownerAddress);
        assert.equal(receivedPrice, tokens[i].price);
        assert.equal(receivedForSale, true);
      }

      assert.equal(balance, tokens.length);
    });
  });

  describe('update function', () => {
    it('Should set for sale and update the price', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      const newPrice = 200;
      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      await nftsrb.connect(alfaSigner).update(0, true, newPrice);

      const receivedForSale = await nftsrb.isForSale(0);
      const receivedPrice = await nftsrb.getPrice(0);

      assert.equal(receivedForSale, true);
      assert.equal(receivedPrice, newPrice);
    });
    it('Should set not for sale and not update the price', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      const newPrice = 200;
      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      await nftsrb.connect(alfaSigner).update(0, false, newPrice);

      const receivedForSale = await nftsrb.isForSale(0);
      const receivedPrice = await nftsrb.getPrice(0);

      assert.equal(receivedForSale, false);
      assert.equal(receivedPrice, price);
    });
    it('Should throw an error when non owner tries to call the function', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      const newPrice = 200;
      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      const promise = nftsrb.connect(betaSigner).update(0, true, newPrice);
      await expect(promise).to.be.rejectedWith();
    });
  });

  describe('buy tests', () => {
    it('Should successfully buy the token', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = ethers.utils.parseEther('1');
      const minterBalanceBefore = await alfaSigner.getBalance();
      const buyerBalanceBefore = await betaSigner.getBalance();
      const constractOwnerBalanceBefore = await contractOwner.getBalance();

      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      await nftsrb.connect(betaSigner).buy(0, { value: price });

      const ownerOfToken = await nftsrb.ownerOf(0);
      const isForSale = await nftsrb.isForSale(0);

      const minterBalanceAfter = await alfaSigner.getBalance();
      const buyerBalanceAfter = await betaSigner.getBalance();
      const constractOwnerBalanceAfter = await contractOwner.getBalance();

      assert.equal(ownerOfToken, betaSigner.address);
      assert.equal(isForSale, false);

      expect(minterBalanceAfter).to.be.gt(minterBalanceBefore);
      expect(constractOwnerBalanceAfter).to.be.gt(constractOwnerBalanceBefore);
      expect(buyerBalanceAfter).to.be.lt(buyerBalanceBefore);
    });
    it('Should throw an error when owner of the token is the buyer', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      const promise = nftsrb.connect(alfaSigner).buy(0, { value: price });
      await expect(promise).to.be.rejectedWith();
    });
    it('Should throw an error for not matching the asking price', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      const promise = nftsrb.connect(betaSigner).buy(0, { value: price - 1 });
      await expect(promise).to.be.rejectedWith();
    });
    it('Should throw an error for buying a token that is not for sale', async () => {
      const tokenUri = 'www.SomeTokenUrl.com';
      const price = 100;
      await nftsrb.connect(alfaSigner).mint(tokenUri, price);

      await nftsrb.connect(alfaSigner).update(0, false, price);
      const promise = nftsrb.connect(betaSigner).buy(0, { value: price });

      await expect(promise).to.be.rejectedWith();
    });
    it('Should throw an error for nonexistant token', async () => {
      const promise = nftsrb.connect(betaSigner).buy(0, { value: 100 });

      await expect(promise).to.be.rejectedWith();
    });
  });
});
