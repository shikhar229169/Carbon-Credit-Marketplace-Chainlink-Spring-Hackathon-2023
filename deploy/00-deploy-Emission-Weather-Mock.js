const { ethers, network } = require("hardhat")
const { localNetworks } = require("../helper-hardhat-config.js")

const WEATHER_RESPONSE = "0x73636174746572656420636c6f756473"
const EMISSION_RESPONSE = "0x000000000000000000000000000000000000000000000028e4d9173abbac00000000000000000000000000000000000000000000000000012b9f169c7caf000000000000000000000000000000000000000000000000000021077563e56e0000000000000000000000000000000000000000000000000001eca955e9b65e0000000000000000000000000000000000000000000000000002c284a7446b230000"

module.exports = async({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (localNetworks.includes(network.name)) {
        log("Watch Out! Deploying locally")

        const weather = await deploy("mockWeatherFeeds", {
            from: deployer,
            log: true,
            args: [WEATHER_RESPONSE]
        })

        const emission = await deploy("mockEmissionFeeds", {
            from: deployer,
            log: true,
            args: [EMISSION_RESPONSE]
        })
    }
}

module.exports.tags = ["mocks", "all"]