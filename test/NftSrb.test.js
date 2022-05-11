const chai = require('chai');
const { ethers } = require('hardhat');
chai.use(require('chai-as-promised'));
const { assert, expect } = chai;

describe('Nft Srbija', function () {
  let NftSrb;
  let nftsrb;
  let accounts;
  let deployedAddress
  let alfaSigner;
  let betaSigner;
  let gamaSigner;
  let contractOwner;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    contractOwner = accounts[0];
    [alfaSigner, betaSigner, gamaSigner] = [accounts[1], accounts[2], accounts[3]];

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
      const mintedToken = await nftsrb.connect(alfaSigner).mint(tokenUri, 100);
      const balance = await nftsrb.balanceOf(alfaSigner.address);
      assert.equal(balance, 1);
      const receivedTokenUri = await nftsrb.tokenURI(0);

      assert.equal(mintedToken.from, alfaSigner.address);
      assert.equal(mintedToken.to, deployedAddress);
      assert.equal(receivedTokenUri, tokenUri);
    });

    it('Should mint three tokens', async () => {
      const tokenURIS = [
        `www.${Math.floor(Math.random() * 10000)}.com`,
        `www.${Math.floor(Math.random() * 10000)}.com`,
        `www.${Math.floor(Math.random() * 10000)}.com`
      ];
      for (const tokenURI of tokenURIS) {
        await nftsrb.connect(alfaSigner).mint(tokenURI, 100);
      }

      const balance = await nftsrb.balanceOf(alfaSigner.address);

      for (let i = 0; i < tokenURIS.length; i++) {
        const ownerAddress = await nftsrb.ownerOf(i);
        assert.equal(alfaSigner.address, ownerAddress);
      }

      assert.equal(balance, tokenURIS.length);
    });
  });

  describe.skip('transferFrom tests', () => {
    it('Should fail when transfering a token that a wallet does not posses', async () => {
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      const promise = nftsrb.connect(alfaSigner).transfer(betaSigner.address, 1);
      await expect(promise).to.be.rejectedWith();
    });

    it('Should fail when signer does not posses the from address', async () => {
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      const promise = nftsrb.connect(betaSigner).transfer(betaSigner.address, 0);
      await expect(promise).to.be.rejectedWith();
    });

    it('Should send token successfully', async () => {
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(alfaSigner).transfer(betaSigner.address, 0);

      const numbeOfAlfaTokens = await nftsrb.balanceOf(alfaSigner.address);
      const numbeOfBetaTokens = await nftsrb.balanceOf(betaSigner.address);
      const ownerOfToken = await nftsrb.ownerOf(0);

      assert.equal(numbeOfAlfaTokens, 0);
      assert.equal(numbeOfBetaTokens, 1);
      assert.equal(betaSigner.address, ownerOfToken);
    });

    it('Contract owner should send token successfully', async () => {
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(contractOwner).transfer(betaSigner.address, 0);

      const numbeOfAlfaTokens = await nftsrb.balanceOf(alfaSigner.address);
      const numbeOfBetaTokens = await nftsrb.balanceOf(betaSigner.address);
      const ownerOfToken = await nftsrb.ownerOf(0);

      assert.equal(numbeOfAlfaTokens, 0);
      assert.equal(numbeOfBetaTokens, 1);
      assert.equal(betaSigner.address, ownerOfToken);
    });
  });
});
