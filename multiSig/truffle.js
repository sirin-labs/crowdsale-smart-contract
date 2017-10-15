module.exports = {
  networks: {
    "live": {
        network_id: 1, // Ethereum public network
        host: "localhost",
        port: 8545,
        gasPrice :21000,
        from:  '0x3111a5b9D2Bd1483C7967d7A304958Fe5E4CC0Ed' //default address to use for any transaction Truffle makes during migrations
    },
    development: {
        host: "localhost",
        port: 8545,
        network_id: "*" // Match any network id
    }
  }
};
