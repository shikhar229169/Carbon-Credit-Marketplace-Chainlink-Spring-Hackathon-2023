const networkConfig = {
    80001: {
        name: "mumbai",
        emissionFeeds: "0x5643a974BaE022Fb61fB24d837f33cBe08372fb8",
        weatherFeeds: "0x3EF9800eE7781C655Dd694FE44700200f45E1a6d",
        admins: ["0xc15BB2baF07342aad4d311D0bBF2cEaf78ff2930", "0xF1c8170181364DeD1C56c4361DED2eB47f2eef1b"],
        approvalsRequired: 2,
        reviewInterval: 0
    },

    31337: {
        name: "hardhat",
        approvalsRequired: 2,
        reviewInterval: 604800
    },

    11155111: {
        name: "sepolia",
    }
}


const localNetworks = ["hardhat", "localhost"]

module.exports = { networkConfig, localNetworks }