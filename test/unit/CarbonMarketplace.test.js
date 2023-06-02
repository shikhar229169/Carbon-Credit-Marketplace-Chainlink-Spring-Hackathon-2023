const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { networkConfig, localNetworks } = require("../../helper-hardhat-config.js")
const { assert } = require("chai")

!localNetworks.includes(network.name) ?
    describe.skip 
    : describe("Carbon Marketplace Testing", () => {
        const chainId = network.config.chainId
        let carbon
        let deployer
        let admin2
        let constructorData = networkConfig[chainId]
        let emissionFeeds;
        let weatherFeeds

        beforeEach(async() => {
            deployer = (await getNamedAccounts()).deployer
            admin2 = (await getNamedAccounts()).admin2

            await deployments.fixture(["all"])

            carbon = await ethers.getContract("CarbonMarketplace", deployer)
            emissionFeeds = await ethers.getContract("mockEmissionFeeds")
            weatherFeeds = await ethers.getContract("mockWeatherFeeds")
        })

        describe("Constructor Testing", () => [
            it("Passes if every args is correctly passed", async() => {
                const admins = []
                for (let i=0; i<2; i++) {
                    const curr = await carbon.admins(i)
                    admins.push(curr)
                }
                
                const approvalsRequired = await carbon.approvalsRequired()
                const emissionFeedsAddress = await carbon.emissionFeeds()
                const weatherFeedsAddress = await carbon.weatherFeeds()
                const reviewInterval = await carbon.reviewInterval()

                const reqAdmin = [deployer, admin2]

                assert.equal(admins[0], reqAdmin[0])
                assert.equal(admins[1], reqAdmin[1])
                assert.equal(approvalsRequired, constructorData.approvalsRequired)
                assert.equal(emissionFeedsAddress, emissionFeeds.address)
                assert.equal(weatherFeedsAddress, weatherFeeds.address)
                assert.equal(reviewInterval, constructorData.reviewInterval)
            })
        ])
    })