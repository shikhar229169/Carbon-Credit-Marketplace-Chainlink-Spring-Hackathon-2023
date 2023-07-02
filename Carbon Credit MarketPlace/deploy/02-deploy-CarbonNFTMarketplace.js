const { ethers, network } = require("hardhat")
const { uploadImageToIpfs } = require("../utils/uploadImageAndJson.js")
const { networkConfig, localNetworks } = require("../helper-hardhat-config.js")
const { verifyContract } = require("../utils/contractVerification.js")
require("dotenv").config()

// PINATA_API_KEY
// PINATA_API_SECRET


const imagesFilePath = "./images"

module.exports = async({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const carbonMarketPlace = await ethers.getContract("CarbonMarketplace");

    const tokenURI = await uploadImageToIpfs(imagesFilePath)
    const price = networkConfig[network.config.chainId].nftCosts

    const args = [tokenURI, price, carbonMarketPlace.address]

    const carbonNFTMarketplace = await deploy("CarbonNFTMarketplace", {
        from: deployer,
        log: true,
        args: args
    })    

    if (!localNetworks.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        await verifyContract(carbonNFTMarketplace.address, args)
    }
}


module.exports.tags = ["nftContract"]