const { ethers, network } = require("hardhat")
const { verifyContract } = require("../utils/contractVerification.js")
const { localNetworks } = require("../helper-hardhat-config.js")
require("dotenv").config()

module.exports = async({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const carbonMarketplace = await ethers.getContract("CarbonMarketplace")

    args = [carbonMarketplace.address]

    const carbonMerch = await deploy("CarbonMerch", {
        from: deployer,
        log: true,
        args: args
    })

    if (process.env.POLYGONSCAN_API_KEY && !localNetworks.includes(network.name)) {
        await verifyContract(carbonMerch.address, args)
    }
}

module.exports.tags = ["all", "carbonMerch"]