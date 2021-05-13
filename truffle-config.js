const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
//const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
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
