const chai = require('chai')
const { ethers } = require('hardhat')
chai.use(require('chai-as-promised'))
const { assert, expect } = chai

describe('Nft Srbija', function () {
    let NftSrb
    let nftsrb
    let accounts
    let signerAddress
    let alfaSigner
    let betaSigner
    let gamaSigner

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        ;[alfaSigner, betaSigner, gamaSigner] = [accounts[0], accounts[1], accounts[2]]
        signerAddress = alfaSigner.address

        NftSrb = await ethers.getContractFactory('NftSrb', alfaSigner)
        nftsrb = await NftSrb.deploy()
        await nftsrb.deployed()

        deployedAddress = nftsrb.address
    })

    it('Should fail for tokenId that does not exist', async () => {
        await expect(nftsrb.tokenURI(0)).to.be.rejectedWith()
    })

    describe('Minting process', () => {
        it('Should mint a token', async () => {
            const tokenUri = 'www.SomeTokenUrl.com'
            const mintedToken = await nftsrb.mint(tokenUri)
            const balance = await nftsrb.balanceOf(signerAddress)
            assert.equal(balance, 1)
            const receivedTokenUri = await nftsrb.tokenURI(0)

            assert.equal(mintedToken.from, signerAddress)
            assert.equal(mintedToken.to, deployedAddress)
            assert.equal(receivedTokenUri, tokenUri)
        })

        it('Should mint three tokens', async () => {
            const tokenURIS = [
                `www.${Math.floor(Math.random() * 10000)}.com`,
                `www.${Math.floor(Math.random() * 10000)}.com`,
                `www.${Math.floor(Math.random() * 10000)}.com`,
            ]
            for (const tokenURI of tokenURIS) {
                await nftsrb.mint(tokenURI)
            }

            const balance = await nftsrb.balanceOf(signerAddress)

            for (let i = 0; i < tokenURIS.length; i++) {
                const ownerAddress = await nftsrb.ownerOf(i)
                assert.equal(signerAddress, ownerAddress)
            }

            assert.equal(balance, tokenURIS.length)
        })
    })

    it('Should return a correct array of token ids', async () => {
        await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)
        await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)
        await nftsrb.connect(betaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)
        await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)
        await nftsrb.connect(gamaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)
        await nftsrb.connect(gamaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)
        await nftsrb.connect(alfaSigner).mint(`www.${Math.floor(Math.random() * 10000)}.com`)

        const [alfaIds, betaIds, gamaIds] = await Promise.all([
            await nftsrb.getAllByAddress(alfaSigner.address),
            await nftsrb.getAllByAddress(betaSigner.address),
            await nftsrb.getAllByAddress(gamaSigner.address),
        ]);

        assert.equal(alfaIds.length,4);
        assert.equal(alfaIds[0], 0)
        assert.equal(alfaIds[1], 1)
        assert.equal(alfaIds[2], 3)
        assert.equal(alfaIds[3], 6)
        assert.equal(betaIds.length,1);
        assert.equal(betaIds[0],2)
        assert.equal(gamaIds.length,2);
        assert.equal(gamaIds[0], 4);
        assert.equal(gamaIds[1], 5);
    })
})
