var SirinCrowdsale = artifacts.require("./Crowdsale/SirinCrowdsale.sol");

module.exports = function(deployer) {

    const MIN = 60;
    const HOUR = 60 * MIN;
    const DAY =  24 * HOUR;

    const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 60 * 2;
    const endTime = startTime + MIN * 10;
    const rate = new web3.BigNumber(100)
    const wallet = web3.eth.accounts[0]

    deployer.deploy(SirinCrowdsale,
                   startTime,
                   endTime,
                   rate,
                   wallet)
};
