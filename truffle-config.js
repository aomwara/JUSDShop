const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = "b57135c2199e24e87cb78cce1c86e707527958370d2c9466435eef7998c4cedd";
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
