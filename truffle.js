require('babel-register');
require('babel-polyfill');

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            gas: 4712388,
            network_id: '*', // Match any network id
            gas: 0xfffffffffff,
            gasPrice: 0x01
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 0x01
        }
    },
    mocha: {
        useColors: true,
        slow: 30000,
        bail: true
    }
};
