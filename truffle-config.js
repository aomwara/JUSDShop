const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = "6e8b93d37dbd7f83ea981f157e39c1461e81d68110e44b9a972173bc5494d691";
const liveNetwork = "https://wrnec-mainnet.aomwara.space";

module.exports = {

  networks: {

    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" 
    },

    live: {
      provider: () => new HDWalletProvider(mnemonic, liveNetwork),
      network_id: "*"
    }
    
  },

  mocha: {
    // timeout: 100000
  },

  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: '^0.7.4',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }



};
