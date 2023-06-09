require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1_000,
          },
        },
      }
    ]
  },

  defaultNetwork: "hardhat",

  networks: {
    hardhat: {},
    
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },

  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0
    },
    admin2: {
      default: 1
    }
  },

  mocha: {
    timeout: 300000
  }
};
