const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { networkConfig, localNetworks } = require("../../helper-hardhat-config.js")
const { assert, expect } = require("chai")

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Carbon NFT Marketplace Testing", () => {
        let carbonMarketplace
        let carbonNFTMarketplace
        let deployer
        let chainId
        let admin2
        let user
        let attacker
        let tokenURIs
        let costs

        let userCarbonNFT
        let userCarbon

        let emissionFeeds

        beforeEach(async() => {
            await deployments.fixture(["all"])
            deployer = (await getNamedAccounts()).deployer

            carbonMarketplace = await ethers.getContract("CarbonMarketplace", deployer)
            carbonNFTMarketplace = await ethers.getContract("CarbonNFTMarketplace", deployer)
            emissionFeeds = await ethers.getContract("mockEmissionFeeds", deployer)

            userCarbonNFT = await carbonNFTMarketplace.connect(user)
            userCarbon = await carbonMarketplace.connect(user)

            chainId = network.config.chainId

            tokenURIs = networkConfig[chainId].tokenURIs
            costs = networkConfig[chainId].nftCosts

            const accounts = await ethers.getSigners()
            // account 0 and 1 are for carbonMarketplace admins
            admin2 = accounts[1]
            user = accounts[2]
            attacker = accounts[3]
        })

        describe("Constructor Testing", () => [
            it("NFTs URI and costs set up correctly", async() => {
                const NFTs = await carbonNFTMarketplace.getAllNft()

                assert.equal(tokenURIs.length, NFTs.length)

                for (let i in tokenURIs) {
                    assert.equal(tokenURIs[i], NFTs[i].tokenURI)
                    assert.equal(costs[i], NFTs[i].cost)
                }
            }),

            it("Carbon Marketplace address set up correctly", async() => {
                const expectedAddress = carbonMarketplace.address
                const actualAddress = await carbonNFTMarketplace.getCarbonMarketplace()

                assert.equal(expectedAddress, actualAddress)
            })
        ])

        describe("Buy NFT Testing", async() => {
            it("Reverts if NFT idx not exist", async() => {
                await expect(carbonNFTMarketplace.buyNFT(tokenURIs.length))
                    .to.be.revertedWith("CarbonNFTMarketplace__invalidNftIdx")
            })

            it("Reverts if buyer has not enough carbon coin", async() => {
                const cost = costs[0]
                
                const response = await userCarbon.approve(carbonNFTMarketplace.address, cost)
                await response.wait(1)
                await expect(userCarbonNFT.buyNFT(0)).to.be.revertedWith("ERC20: transfer amount exceeds balance")
            })

            it("Allows buyer to buy NFT, if they have enough carbon coin and approval is given and tokenURI function works correct", async() => {
                // to get carbon coin, user is required to reduce the carbon emissions through their project executed after submitting their proposal
                // so, user will first submit the proposal, then the admins will verify the proposal
                // Then we will modify the carbon emissions and will pretend it has decreased by significant amount
                // boom the user now has carbon coin
                const carbonMarketplace2 = await carbonMarketplace.connect(admin2)
                
                const projectName = "G20 Agra"
                const projectLink = "G20Agra.agra-gov.in"
                const pinCode = "282005"
                const countryCode = "IN"

                const projectId = await carbonMarketplace.totalProjects()

                const submitProposalResponse = await userCarbon.submitProposal(
                    projectName, projectLink, pinCode, countryCode
                )
                await submitProposalResponse.wait(1)

                const approvalResponse1 = await carbonMarketplace.giveApproval(projectId)
                await approvalResponse1.wait(1)

                const approvalResponse2 = await carbonMarketplace2.giveApproval(projectId)
                await approvalResponse2.wait(1)

                const deployProjectResponse = await carbonMarketplace.deployProject(projectId)
                await deployProjectResponse.wait(1)

                // fake that the emission feeds are reduced, lets reduce them to zero
                const setEmissionFeedsResponse = await emissionFeeds.setResponse(0, 0, 0, 0, 0)
                await setEmissionFeedsResponse.wait(1)

                // Admin will review the project
                const reviewInterval = await carbonMarketplace.reviewInterval()
                await ethers.provider.send("evm_increaseTime", [reviewInterval.toNumber() + 1])
                await ethers.provider.send("evm_mine", [])

                const reviewResponse = await carbonMarketplace.reviewProject(projectId)
                await reviewResponse.wait(1)

                // At this point the user will have certain amount of carbon coin
                // time to buy nft, lettttt's go

                // lets buy nft at 4th idx
                const nftIdx = 4
                const initUserNftBalance = await carbonNFTMarketplace.balanceOf(user.address)
                const initUserCoinBalance = await carbonMarketplace.balanceOf(user.address)
                const tokenId = await carbonNFTMarketplace.getTokenCounter()

                const cost = costs[nftIdx]
                const response = await userCarbon.approve(carbonNFTMarketplace.address, cost)
                await response.wait(1)
                const buyResponse = await userCarbonNFT.buyNFT(nftIdx)
                await buyResponse.wait(1)
                
                const finalUserNftBalance = await carbonNFTMarketplace.balanceOf(user.address)
                const finalUserCoinBalance = await carbonMarketplace.balanceOf(user.address)
                const ownerOfNft = await carbonNFTMarketplace.ownerOf(tokenId)
                const tokenURI = await carbonNFTMarketplace.tokenURI(tokenId)
                const tokenCounter = await carbonNFTMarketplace.getTokenCounter()

                assert.equal(user.address, ownerOfNft)
                assert.equal(finalUserNftBalance.toString(), initUserNftBalance.add(1).toString())
                assert.equal(finalUserCoinBalance.toString(), initUserCoinBalance.sub(cost).toString())
                assert.equal(tokenURI, tokenURIs[nftIdx])
                assert.equal(tokenCounter.toString(), tokenId.add(1).toString())
            })
        })

        describe("Add NFT Testing", () => {
            it("Reverts if caller is not admin", async() => {
                // lets add any previous nft (for testing purpose)
                const currTokenURI = tokenURIs[0]
                const currCost = costs[0]

                const attackerInstance = await carbonNFTMarketplace.connect(attacker)
                await expect(attackerInstance.addNFT(currTokenURI, currCost)).to.be.revertedWith("CarbonNFTMarketplace__notAdmin")
            })

            it("Allows admin to add NFT", async() => {
                const currTokenURI = tokenURIs[0]
                const currCost = costs[0]

                const currNFTIdx = await carbonNFTMarketplace.getTotalAvailableNFTs()

                const txnResponse = await carbonNFTMarketplace.addNFT(currTokenURI, currCost)
                await txnResponse.wait(1)
                const actualNFT = await carbonNFTMarketplace.getNFTAtIdx(currNFTIdx)

                assert.equal(currTokenURI, actualNFT.tokenURI)
                assert.equal(currCost, actualNFT.cost)
            })
        })

        describe("Change Price Testing", () => {
            it("Reverts if caller is not admin", async() => {
                const attackerInstance = await carbonNFTMarketplace.connect(attacker)
                const newPrice = 0
                await expect(attackerInstance.changePrice(0, newPrice)).to.be.revertedWith("CarbonNFTMarketplace__notAdmin")
            })

            it("Allows admin to change price", async() => {
                const nftIdx = 0
                const newPrice = BigInt(50e18)

                const txnResponse = await carbonNFTMarketplace.changePrice(nftIdx, newPrice)
                await txnResponse.wait(1)
                const actualPrice = (await carbonNFTMarketplace.getNFTAtIdx(nftIdx)).cost

                assert.equal(newPrice, actualPrice)
            })
        })
    })