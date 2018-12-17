require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    docker: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "http://eth-node:8545")
      },
      network_id: "*"
    },
    poa_sokol: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://sokol.poa.network")
      },
      network_id: 77,
      gas: 1000000,
      gasPrice: 1000000000
    }
  }
};