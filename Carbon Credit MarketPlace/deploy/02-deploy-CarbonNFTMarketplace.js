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
    const chainId = network.config.chainId

    const carbonMarketPlace = await ethers.getContract("CarbonMarketplace");

    let tokenURI
    if (process.env.UPLOAD_TO_IPFS == "true") {
        tokenURI = await uploadImageToIpfs(imagesFilePath)
        console.log(tokenURI)
    }
    else {
        tokenURI = networkConfig[chainId].tokenURIs
    }

    const price = networkConfig[chainId].nftCosts

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


module.exports.tags = ["all", "nftContract"]