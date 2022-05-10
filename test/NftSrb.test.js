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
      const mintedToken = await nftsrb.connect(alfaSigner).mint(tokenUri);
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
        await nftsrb.connect(alfaSigner).mint(tokenURI);
      }

      const balance = await nftsrb.balanceOf(alfaSigner.address);

      for (let i = 0; i < tokenURIS.length; i++) {
        const ownerAddress = await nftsrb.ownerOf(i);
        assert.equal(alfaSigner.address, ownerAddress);
      }

      assert.equal(balance, tokenURIS.length);
    });
  });

  describe('transferFrom tests', () => {
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

  describe('getAllByAddress tests', () => {
    it('Should return a correct array of token ids', async () => {
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(betaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(gamaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(gamaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);
      await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`);

      const [alfaIds, betaIds, gamaIds] = await Promise.all([
        await nftsrb.connect(alfaSigner).getAllByAddress(),
        await nftsrb.connect(betaSigner).getAllByAddress(),
        await nftsrb.connect(gamaSigner).getAllByAddress()
      ]);

      assert.equal(alfaIds.length, 4);
      assert.equal(alfaIds[0], 0);
      assert.equal(alfaIds[1], 1);
      assert.equal(alfaIds[2], 3);
      assert.equal(alfaIds[3], 6);
      assert.equal(betaIds.length, 1);
      assert.equal(betaIds[0], 2);
      assert.equal(gamaIds.length, 2);
      assert.equal(gamaIds[0], 4);
      assert.equal(gamaIds[1], 5);
    });
  });
});
