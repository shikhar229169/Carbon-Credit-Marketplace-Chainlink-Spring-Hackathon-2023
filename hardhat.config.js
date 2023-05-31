require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",

  defaultNetwork: "hardhat",

  networks: {
    hardhat: {},
    mumbai: {
      chainId: 80001,
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },

    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },

  polygonscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },

  namedAccounts: {
    deployer: {
      default: 0
    }
  },

  mocha: {
    timeout: 300000
  }
};
