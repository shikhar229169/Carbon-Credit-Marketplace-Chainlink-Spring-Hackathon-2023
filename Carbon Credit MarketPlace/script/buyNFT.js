const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { buyer } = await getNamedAccounts()
    const carbonMarketplace = await ethers.getContractAt("CarbonMarketplace", "0xD0d2637d61e8AA078aB03B2E7637c919cda9Bc71", buyer)
    const carbonNFTMarketplace = await ethers.getContractAt("CarbonNFTMarketplace", "0xc544739dbAaae484Dec32dB612a9311D2109921B", buyer)

    const nftIdx = 3
    const cost = (await carbonNFTMarketplace.getNFTAtIdx(nftIdx)).cost

    console.log(`Giving approval to ${carbonNFTMarketplace.address} to spend ${cost} Carbon Coins...`)
    const approveResponse = await carbonMarketplace.approve(carbonNFTMarketplace.address, cost)
    await approveResponse.wait(1)
    console.log(`Approval Given!`)

    console.log(`Buying NFT...`)
    const buyResponse = await carbonNFTMarketplace.buyNFT(nftIdx)
    const receipt = await buyResponse.wait(1)

    const tokenId = receipt.events[2].args.tokenId.toString()
    const owner = receipt.events[2].args.owner
    console.log(`Bought NFT! Token Id: ${tokenId} to ${owner}`)
    
    const uri = await carbonNFTMarketplace.tokenURI(tokenId)

    console.log(`Token URI - ${uri}`)
}


main() 
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })