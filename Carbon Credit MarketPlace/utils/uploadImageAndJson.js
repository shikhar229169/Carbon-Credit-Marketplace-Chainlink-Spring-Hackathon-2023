const pinataSDK = require("@pinata/sdk")
const path = require("path");
const fs = require("fs");
require("dotenv").config()

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET)

const metadata = {
    name: "",
    description: "",
    image: "",
    attributes: "Carbon Marketplace NFTs"
}

function getDescription(idx) {
    if (idx == 0) {
        return "Thanks for reducing carbon emissions and keeping them neutral."
    }
    else if (idx == 1) {
        return "A simple CO2 NFT."
    }
    else if (idx == 2) {
        return "The carbon footprint (or greenhouse gas footprint) serves as an indicator to compare the total amount of greenhouse gases emitted from an activity, product, service, company or country."
    }
    else if (idx == 3) {
        return "Huh-Need Oxygen, woah you got to the right place, breath this NFT, and get abundant oxygen."
    }
    else if (idx == 4) {
        return "Yet another oxygen generator NFT, want more oxygen huh, breath this NFT too."
    }
}

const uploadImageToIpfs = async(imagesFilePath) => {
    const fullPath = path.resolve(imagesFilePath)
    const allImagesName = fs.readdirSync(fullPath)

    const imagesURI = []
    const tokenURI = []

    for (let i in allImagesName) {
        const currImagePath = `${fullPath}/${allImagesName[i]}`
        const currImageReadStream = fs.createReadStream(currImagePath)
        
        const options = {
            pinataMetadata: {
                name: allImagesName[i]
            }
        }

        console.log(`Uploading Image - ${i}...`)

        const imageUploadResponse = await pinata.pinFileToIPFS(currImageReadStream, options)
        imagesURI.push(`ipfs://${imageUploadResponse.IpfsHash}`)
        
        
        const jsonMetadata = { ...metadata }
        jsonMetadata.name = allImagesName[i].replace(".png", "").replace(".jpg", "")
        jsonMetadata.description = getDescription(i)
        jsonMetadata.image = imagesURI[i]
        
        const jsonOptions = {
            pinataMetadata: {
                name: jsonMetadata.name
            }
        }

        console.log(`Pinning JSON - ${i}`)
        const jsonUploadResponse = await pinata.pinJSONToIPFS(jsonMetadata, jsonOptions)
        tokenURI.push(`ipfs://${jsonUploadResponse.IpfsHash}`)
    }
    
    return tokenURI
}


module.exports = { uploadImageToIpfs }