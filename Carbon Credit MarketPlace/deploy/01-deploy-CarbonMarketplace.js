const { ethers, network } = require("hardhat")
const { networkConfig, localNetworks } = require("../helper-hardhat-config.js")
const { verifyContract } = require("../utils/contractVerification.js")
require("dotenv").config()


module.exports = async({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let admins
    const approvalsRequired = networkConfig[chainId].approvalsRequired
    let emissionFeeds
    let weatherFeeds
    let reviewInterval = networkConfig[chainId].reviewInterval

    
    if (localNetworks.includes(network.name)) {
        emissionFeeds = (await ethers.getContract("mockEmissionFeeds")).address
        weatherFeeds = (await ethers.getContract("mockWeatherFeeds")).address

        const accounts = await ethers.getSigners();
        admins = [accounts[0].address, accounts[1].address]
    }
    else {
        admins = networkConfig[chainId].admins
        emissionFeeds = networkConfig[chainId].emissionFeeds
        weatherFeeds = networkConfig[chainId].weatherFeeds
    }

    const args = [admins, approvalsRequired, emissionFeeds, weatherFeeds, reviewInterval]
    
    const CarbonMarketplace = await deploy("CarbonMarketplace", {
        from: deployer,
        log: true,
        args: args
    })

    if (process.env.POLYGONSCAN_API_KEY && !localNetworks.includes(network.name)) {
        await verifyContract(CarbonMarketplace.address, args)
    }
}

module.exports.tags = ["main", "all"]