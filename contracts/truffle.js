module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    docker: {
      host: "eth-node",
      port: 8545,
      network_id: "*"
    }
  }
};