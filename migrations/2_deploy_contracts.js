var SirinCrowdsale = artifacts.require("./Crowdsale/SirinCrowdsale.sol");

module.exports = function(deployer) {

    const MIN = 60;
    const HOUR = 60 * MIN;
    const DAY =  24 * HOUR;

    //TODO: CHANGE ADDRESS BEFORE PUBLISH!

    const FOUNDER_WALLET_ADDRESS = "0x00AAD1d92EB0aAb2766dEb44b84CC783941a0C9d";

    const DEVELOPERS_ADDRESS = "0x000AB5641cA153Cf75EB28AeFa33AF152222737B";

    const BOUNTIES_ADDRESS = "0x0014652c7c2810094eB693BaE2854fA4954C86A4";

    const SIRIN_LABS_RESERVE_ADDRESS = "0x0073FE89849721aFb4e60F836D10516D09f8a9F5";

    const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 60 * 2;
    const endTime = startTime + DAY * 14;
    const rate = new web3.BigNumber(1000)
    const wallet = web3.eth.accounts[0]

    // deployer.deploy(SirinCrowdsale,
    //                startTime,
    //                endTime,
    //                wallet,
    //                FOUNDER_WALLET_ADDRESS,
    //                DEVELOPERS_ADDRESS,
    //                BOUNTIES_ADDRESS,
    //                SIRIN_LABS_RESERVE_ADDRESS)
};
