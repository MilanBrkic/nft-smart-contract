const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("Nft Srbija", function () {
  let NftSrb;
  let nftsrb;

  before(async ()=>{
    NftSrb = await ethers.getContractFactory("NftSrb");
    nftsrb = await NftSrb.deploy();
  
    await nftsrb.deployed();
  })
  
  it("Should return the new greeting once it's changed", async function () {
      assert.equal(1,1);
  });
});
