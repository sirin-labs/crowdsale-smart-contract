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
        this.crowdsale = await SirinCrowdsale.new(this.startTime,
            this.endTime,
            wallet,
            walletFounder,
            walletOEM,
            walletBounties,
            walletReserve, {
                from: owner
            })
        this.refundVault = RefundVault.at(await this.crowdsale.refundVault());
    })

    describe('Valid initialization', function() {

        it('state Should be \'active\' ', async function() {
            let state = await this.refundVault.state();
            assert.equal(state, STATE_ACTIVE);
        });

        it('Token Refund Wallet Should be set ', async function() {
            let tokenRefundWallet = await this.refundVault.tokenRefundWallet()
            assert.notEqual(tokenRefundWallet, null);
        });

        it('Token Refund Wallet Should not be \'0x0\' ', async function() {
            let tokenRefundWallet = await this.refundVault.tokenRefundWallet()
            assert.notEqual(tokenRefundWallet, "0x0");
        });

        it('Ether Wallet Should be set ', async function() {
            let etherWallet = await this.refundVault.etherWallet()
            assert.notEqual(etherWallet, null);
        });

        it('Ether Wallet Should not be \'0x0\' ', async function() {
            let etherWallet = await this.refundVault.etherWallet()
            assert.notEqual(etherWallet, "0x0");
        });

        it('Token Should be set ', async function() {
            let token = await this.refundVault.token()
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
            let tokensAmount = await this.refundVault.depositedToken(investor);
            assert.equal(tokensAmount, value * 500);
        });

        it('Should deposit 100 and have 100wei ether balance', async function() {
        });

        it('Should have \'Deposit\' event', async function() {
        });

    });

    describe('Close', function() {
        it('Should require state  \'Refunding\'', async function() {
        });

        it('Should change state to \'Closed\'', async function() {
        });

        it('Should transfer all ether balance to Sirin Labs wallet \'Close\'', async function() {
        });

        it('Should have \'Closed\' event', async function() {
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

        it('Should require state  \'Refunding\'', async function() {
        });
    });

    describe('ClaimToken', function() {
    });
})