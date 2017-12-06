import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'


const utils = require('./helpers/Utils');

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

const SirinCrowdsale = artifacts.require('../contracts/SirinCrowdsale.sol')
const SirinSmartToken = artifacts.require('SirinSmartToken.sol')
const RefundVault = artifacts.require('../contracts/crowdsale/RefundVault.sol')
const STATE_ACTIVE = "0";
const STATE_REFUNDING = "1";
const STATE_CLOSED = "2";
contract('RefundVault', function([_, investor, owner, wallet, walletFounder, walletOEM, walletBounties, walletReserve]) {

    const value = ether(1)

    before(async function() {
        //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    })
    //new RefundVault(_wallet, token, _walletReserve);
    beforeEach(async function() {
        this.startTime = latestTime() + duration.weeks(1);
        this.endTime = this.startTime + duration.weeks(1);
        this.afterEndTime = this.endTime + duration.seconds(1);

        this.token = await SirinSmartToken.new({from: owner});
        this.vault = await RefundVault.new(wallet, this.token.address, wallet,{from: owner});

        this.crowdsale = await SirinCrowdsale.new(this.startTime,
            this.endTime,
            wallet,
            walletFounder,
            walletOEM,
            walletBounties,
            walletReserve,
            this.token.address,
            this.vault.address,
            {
                from: owner
            })

        await this.token.transferOwnership(this.crowdsale.address, {from: owner});
        await this.vault.transferOwnership(this.crowdsale.address, {from: owner});

        await this.crowdsale.claimTokenOwnership({from: owner})
        await this.crowdsale.claimRefundVaultOwnership({from: owner})

    })

    describe('Valid initialization', function() {

        it('state Should be \'active\' ', async function() {
            let state = await this.vault.state();
            assert.equal(state, STATE_ACTIVE);
        });

        it('Token Refund Wallet Should be set ', async function() {
            let tokenRefundWallet = await this.vault.tokenRefundWallet()
            assert.notEqual(tokenRefundWallet, null);
        });

        it('Token Refund Wallet Should not be \'0x0\' ', async function() {
            let tokenRefundWallet = await this.vault.tokenRefundWallet()
            assert.notEqual(tokenRefundWallet, "0x0");
        });

        it('Ether Wallet Should be set ', async function() {
            let etherWallet = await this.vault.etherWallet()
            assert.notEqual(etherWallet, null);
        });

        it('Ether Wallet Should not be \'0x0\' ', async function() {
            let etherWallet = await this.vault.etherWallet()
            assert.notEqual(etherWallet, "0x0");
        });

        it('Token Should be set ', async function() {
            let token = await this.vault.token()
            assert.notEqual(token, null);
        });
    });

    describe('Deposit', function() {

        it('Should require state  \'Active\'', async function() {
        });

        it('Should deposit 100 wei and get 50 tokens on the first day', async function() {
            await increaseTimeTo(this.startTime);
            let value = 100;
            await this.crowdsale.buyTokensWithGuarantee({value: value, from:investor});
            let tokensAmount = await this.vault.depositedToken(investor);
            assert.equal(tokensAmount, value * 500);
        });

        it('Should deposit 100 and have 100wei ether balance', async function() {
        });

        it('Should have \'Deposit\' event', async function() {
        });

    });

    describe('EnableRefunds', function() {
        it('Should require state  \'Active\'', async function() {
        });

        it('Should change state to \'Refunding\'', async function() {
        });

        it('Should have \'Refunding\' event', async function() {
        });
    });

    describe('RefundETH', function() {
        it('Should require state  \'Refunding\'', async function() {

        });

        it('Should fail to refund while state is  \'Active\'', async function() {

        });

        it('Should fail to refund while state is  \'Closed\'', async function() {

        });

        it('Should fail if investor is \'0x0\'', async function() {
        });

        it('Should fail if investor is not the origin of the tx', async function() {
        });

        it('Should fail if ETHToRefundAmountWei is 0', async function() {
        });

        it('Should fail if investor try to ask for a refund more then he invested', async function() {
        });

        it('Should decrease investor investment according to ether withdrawal', async function() {
        });

        it('Should send investor withdrawal amount', async function() {
        });

        it('Should decrease investor token balance according to ether withdrawal proportion', async function() {
        });

        it('Should transfer tokens to sirin according to ether withdrawal proportion', async function() {
        });

        it('Should have \'RefundedETH\' event', async function() {
        });
    });

    describe('Close', function() {
        it('Should require state  \'Refunding\'', async function() {
        });

        it('Should change state to \'Closed\'', async function() {
        });

        it('Should transfer all ether balance to Sirin Labs wallet \'Close\'', async function() {
        });

        it('Should fail to refund while state is \'Closed\'', async function() {
        });

        it('Should have \'Closed\' event', async function() {
        });
    });

    describe('ClaimToken', function() {
        it('Should require state  \'Refunding\' or \'Closed\'', async function() {
        });

        it('Should fail to claim while \'Active\'', async function() {
        });

        it('Should fail if investor is \'0x0\'', async function() {
        });

        it('Should fail if investor is not the origin or the sender is the owner', async function() {
        });

        it('Should fail if tokensToClaim is 0', async function() {
        });

        it('Should fail if investor try to claim more tokens then he has bought', async function() {
        });

        it('Should decrease investor tokens balance according to token withdrawal', async function() {
        });

        it('Should transfer the investor tokens according to claim amount', async function() {
        });

        it('Should decrease investor ether balance according to token withdrawal proportion', async function() {
        });

        it('Should send ether to sirin according to token withdrawal proportion', async function() {
        });

        it('Should have \'TokensClaimed\' event', async function() {
        });
    });
})