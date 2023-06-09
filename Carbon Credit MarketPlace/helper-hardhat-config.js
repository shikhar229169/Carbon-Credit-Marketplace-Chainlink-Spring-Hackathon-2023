const networkConfig = {
    80001: {
        name: "mumbai",
        emissionFeeds: "0x12D48b7Fa83dCF26b91591A63349048173c6a288",
        weatherFeeds: "0x60e55982f7DF115D58eae49E631eE2FdC8aB0Ef6",
        admins: ["0xc15BB2baF07342aad4d311D0bBF2cEaf78ff2930", "0xF1c8170181364DeD1C56c4361DED2eB47f2eef1b"],
        approvalsRequired: 2,
        reviewInterval: 0
    },

    31337: {
        name: "hardhat",
        approvalsRequired: 2,
        reviewInterval: 604800
    }
}


const localNetworks = ["hardhat", "localhost"]

module.exports = { networkConfig, localNetworks }