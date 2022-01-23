const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("Nft Srbija", function () {
  let NftSrb;
  let nftsrb;
  let accounts;
  let signerAddress;
  let signer;

  beforeEach(async ()=>{
    accounts = await ethers.getSigners();
    signer = accounts[0];
    signerAddress = signer.address;

    NftSrb = await ethers.getContractFactory("NftSrb", signer);
    nftsrb = await NftSrb.deploy();
    await nftsrb.deployed();

    deployedAddress = nftsrb.address;
  })
  
  it("Should mint a token", async () => {
    const tokenUri = 'www.SomeTokenUrl.com';
    const mintedToken = await nftsrb.mint(tokenUri);
    const balance  = await nftsrb.balanceOf(signerAddress);
    assert.equal(balance, 1);
    const receivedTokenUri = await nftsrb.tokenURI(0);

    assert.equal(mintedToken.from, signerAddress);
    assert.equal(mintedToken.to, deployedAddress);
    assert.equal(receivedTokenUri, tokenUri);
  });

  it("Should mint three tokens", async()=>{
    const tokenURIS = [
                      `www.${Math.floor(Math.random()*10000)}.com`,
                      `www.${Math.floor(Math.random()*10000)}.com`,
                      `www.${Math.floor(Math.random()*10000)}.com`
                    ]
    for(const tokenURI of tokenURIS){
      await nftsrb.mint(tokenURI);
    }

    const balance  = await nftsrb.balanceOf(signerAddress);
    
    for(let i = 0;i < tokenURIS.length;i++){
      const ownerAddress = await nftsrb.ownerOf(i);
      assert.equal(signerAddress, ownerAddress);
    }

    assert.equal(balance, tokenURIS.length);
  })
});
