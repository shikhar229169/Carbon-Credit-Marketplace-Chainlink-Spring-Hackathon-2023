const { run } = require("hardhat")

const verifyContract = async(contractAddress, args) => {
    try {
        console.log("Verifying Contract...")
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        })
        console.log("Successfully Verified.")
    }
    catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log("Contract is already verified!")
        }
        else {
            console.log(err)
        }
    }
}

module.exports = { verifyContract }