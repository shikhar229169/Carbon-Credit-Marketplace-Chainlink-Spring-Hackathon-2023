const networkConfig = {
    80001: {
        name: "mumbai",
        emissionFeeds: "0x12D48b7Fa83dCF26b91591A63349048173c6a288",
        weatherFeeds: "0x60e55982f7DF115D58eae49E631eE2FdC8aB0Ef6",
        admins: ["0xc15BB2baF07342aad4d311D0bBF2cEaf78ff2930", "0xF1c8170181364DeD1C56c4361DED2eB47f2eef1b"],
        approvalsRequired: 2,
        reviewInterval: 0,
        nftCosts: [20, 30, 25, 30, 40],
        tokenURIs: [
            'ipfs://QmediNdYv7EURRf7KCnUhtS4vPuiLEciz9hZowDV7q14M9',
            'ipfs://QmTfSWwYyaLrkmqK6Cd26AKQe1GJjBuYLvKn8qbgjkNW1A',
            'ipfs://QmcMAT9MHhfCNQq3wjm2YoqXQDoxrvv3La6m2L7CUdXxuC',
            'ipfs://QmdiSJgPikr4pBcMRKi5JqN5HViL6sD33zNP4yzJ5shkoy',
            'ipfs://QmZMtt7KvNhxiqJJyZSiWZFEZaMJt36eYUH911cnka4e8Z'
        ]
    },

    31337: {
        name: "hardhat",
        approvalsRequired: 2,
        reviewInterval: 604800,
        nftCosts: [20, 30, 25, 30, 40],
        tokenURIs: [
            'ipfs://QmediNdYv7EURRf7KCnUhtS4vPuiLEciz9hZowDV7q14M9',
            'ipfs://QmTfSWwYyaLrkmqK6Cd26AKQe1GJjBuYLvKn8qbgjkNW1A',
            'ipfs://QmcMAT9MHhfCNQq3wjm2YoqXQDoxrvv3La6m2L7CUdXxuC',
            'ipfs://QmdiSJgPikr4pBcMRKi5JqN5HViL6sD33zNP4yzJ5shkoy',
            'ipfs://QmZMtt7KvNhxiqJJyZSiWZFEZaMJt36eYUH911cnka4e8Z'
        ]
    }
}


const localNetworks = ["hardhat", "localhost"]

module.exports = { networkConfig, localNetworks }