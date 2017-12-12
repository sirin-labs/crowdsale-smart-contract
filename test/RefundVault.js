import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, increaseTime, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'


const utils = require('./helpers/Utils');

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

const SirinSmartToken = artifacts.require('SirinSmartToken.sol')
const RefundVault = artifacts.require('../contracts/crowdsale/RefundVault.sol')
const STATE_ACTIVE = "0";
const STATE_REFUNDING = "1";
const STATE_CLOSED = "2";

contract('RefundVault', function([_, investor, owner, wallet, walletTeam, walletOEM, walletBounties, walletReserve]) {

    const value = ether(1)

    before(async function() {
     //   Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock()
    })

    describe('Valid initialization', function() {
        before(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
        });

        //TODO fix this
//        it('Should have \'Active\' event', async function() {
//            const {
//                logs
//            } = await RefundVault.new(wallet, this.token.address,{from: owner});
//            const event = logs.find(e => e.event === "Active");
//            should.exist(event);
//        });

        it('state Should be \'active\' ', async function() {
            let state = await this.vault.state();
            assert.equal(state, STATE_ACTIVE);
        });

        it('Token Refund Wallet Should be set ', async function() {
            let tokenRefundWallet = await this.vault.etherWallet()
            assert.notEqual(tokenRefundWallet, null);
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
        before(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
        });

        it('state Should only be \'active\' ', async function() {
            let state = await this.vault.state();
            assert.equal(state, STATE_ACTIVE);
        });

        it('non owner cant deposit', async function () {
            await this.vault.deposit(investor, 1, { from: _ }).should.be.rejectedWith(EVMThrow);
        });


        it('Should deposit 100 wei and get 500 tokens', async function() {
            let tokensAmountToDeposit = value * 500;
            await this.vault.deposit(investor, tokensAmountToDeposit, {value: value, from:owner});
            let tokensAmountInVault = await this.vault.depositedToken(investor);
            assert.equal(tokensAmountInVault + "", tokensAmountToDeposit + "");
        });

        it('Should deposit 100 wei and have 100 wei balance', async function() {
            let valueActual = await this.vault.depositedETH(investor);
            assert.equal(valueActual + "", value + "");
        });

        it('Should have \'Deposit\' event', async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});

            let tokensAmountToDeposit = value * 500;
            const {
                logs
            } = await this.vault.deposit(investor, tokensAmountToDeposit, {value: value, from:owner});
            const event = logs.find(e => e.event === "Deposit")
            should.exist(event)
        })
    });

    describe('Close', function() {
        before(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
            await this.vault.enableRefunds({ from : owner });

        });

        it('Should require state  \'Refunding\'', async function() {
            let state = await this.vault.state();
            assert.equal(state, STATE_REFUNDING);
        });

        it('Should transfer all ether balance to Sirin Labs wallet \'Close\'', async function() {
            let vaultBalance = await web3.eth.getBalance(this.vault.address);
            let walletBalanceBefore = await web3.eth.getBalance(wallet);

            await increaseTime((await this.vault.refundStartTime()).toNumber() );
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);

            await this.vault.close({ from : owner });

            let walletBalanceAfter = await web3.eth.getBalance(wallet);
            walletBalanceBefore.minus(walletBalanceBefore).should.be.bignumber.equal(vaultBalance);

        });

        it('Should change state to \'Closed\'', async function() {
            let state = await this.vault.state();
            assert.equal(state, STATE_CLOSED);
        });

        it('Should fail to refund while state is \'Closed\'', async function() {

            try {
                await this.vault.claimTokens(1 ,{from:investor})
            } catch (error) {
                return utils.ensureException(error);
            }
            assert(false, "did not throw with error if state is \'Closed\'")
        });

        it('Should have \'Closed\' event', async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
            await this.vault.enableRefunds({ from : owner });

            await increaseTime((await this.vault.refundStartTime()).toNumber() );
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);

            const {
                logs
            } = await this.vault.close({from:owner});
            const event = logs.find(e => e.event === "Closed")
            should.exist(event)
        });
    });

    describe('EnableRefunds', function() {
        before(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
        });

        it('initial state Should be \'active\' ', async function() {
            let state = await this.vault.state();
            assert.equal(state, STATE_ACTIVE);
        });

        it('only owner cant enableRefunds', async function () {
            await this.vault.enableRefunds({ from : _ }).should.be.rejectedWith(EVMThrow);
            this.vault.enableRefunds({from:owner});
        });

        it('Should change state to \'Refunding\'', async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
            await this.vault.enableRefunds({ from : owner });
            let state = await this.vault.state();
            assert.equal(state, STATE_REFUNDING);
        });

        it('Should have \'Refunding\' event', async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});

            const {
                logs
            } = await this.vault.enableRefunds({from:owner});
            const event = logs.find(e => e.event === "RefundsEnabled")
            should.exist(event)
        });
    });

    describe('RefundETH', function() {

        beforeEach(async function() {

            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});

            this.startTime = latestTime() + duration.weeks(1);
            await increaseTimeTo(this.startTime)
        })

        it('Should require state  \'Refunding\'', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            this.vault.enableRefunds({from:owner});

            let investorEthBlance = await this.vault.depositedETH(investor);
            console.log("###########investorEthBlance: " + investorEthBlance);

            await this.vault.refundETH(ether(1), {from:investor});
        });

        it('Should fail to refund while state is  \'Active\'', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});

            try {
                await this.vault.refundETH(ether(1), {from:investor});
            } catch (error) {
                return utils.ensureException(error);
            }
            assert(false, "did not throw with error if state is \'Active\'")

        });

        it('Should fail to refund while state is  \'Closed\'', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            await this.vault.enableRefunds({from:owner});

            await increaseTime((await this.vault.refundStartTime()).toNumber() );
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);
            await this.vault.close({from:owner});

            try {
                await this.vault.refundETH(ether(1), {from:investor});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error if state is \'Close\'")
        });

        it('Should fail if investor is \'0x0\'', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            await this.vault.enableRefunds({from:owner});

            await increaseTime((await this.vault.refundStartTime()).toNumber() );
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);
            await this.vault.close({from:owner});

            try {
                await this.vault.refundETH(ether(1), {from:0x0});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error if investor is '0x0'")
        });

        it('Should fail if ETHToRefundAmountWei is 0', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            await this.vault.enableRefunds({from:owner});

            await increaseTime((await this.vault.refundStartTime()).toNumber() );
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);
            await this.vault.close({from:owner});

            try {
                await this.vault.refundETH(0, {from:investor});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error if ETHToRefundAmountWei is 0'")

        });

        it('Should fail if investor try to ask for a refund more then he invested', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            await this.vault.enableRefunds({from:owner});

            await increaseTime((await this.vault.refundStartTime()).toNumber());
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);
            await this.vault.close({from:owner});

            try {
                await this.vault.refundETH(ether(2), {from:investor});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error investor try to ask for a refund more then he invested'")
        });

        it('Should decrease investor investment according to ether withdrawal', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            this.vault.enableRefunds({from:owner});

            await this.vault.refundETH(ether(0.5), {from:investor});

            let etherAmountActual = await this.vault.depositedETH(investor);
            etherAmountActual.should.be.bignumber.equal(ether(0.5));

        });

        it('Should send investor withdrawal amount', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            this.vault.enableRefunds({from:owner});

            let investorBalanceBefore = await web3.eth.getBalance(investor);
            await this.vault.refundETH(ether(0.5), {from:investor});
            let investorBalanceAfter = await web3.eth.getBalance(investor);

            assert(investorBalanceAfter > investorBalanceBefore)
        });

        it('Should decrease investor token balance according to ether withdrawal proportion', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            this.vault.enableRefunds({from:owner});

            await this.vault.refundETH(ether(0.5), {from:investor});

            let tokensAmountActual = await this.vault.depositedETH(investor);
            tokensAmountActual.should.be.bignumber.equal(ether(0.5));

        });

        it('Should burn tokens according to ether withdrawal proportion', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            this.vault.enableRefunds({from:owner});

            let totalSupplyBefore = await this.token.totalSupply();
            parseInt(totalSupplyBefore).should.not.be.equal(0);
            await this.vault.refundETH(ether(1), {from:investor});
            let totalSupplyAfter = await this.token.totalSupply();
            parseInt(totalSupplyAfter).should.be.equal(0);
        });

        it('Should have \'RefundedETH\' event', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});
            this.token.setDestroyEnabled(true, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            this.vault.enableRefunds({from:owner});

            const {logs} = await this.vault.refundETH(ether(1), {from:investor});;
            const event = logs.find(e => e.event === "RefundedETH")
            should.exist(event)
        });
    });

    describe('ClaimToken', function() {

        beforeEach(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
        })

        it('Should require state  \'Refunding\' or \'Closed\'', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            this.vault.enableRefunds({from:owner});

            await this.vault.claimTokens(tokensAmount/2 ,{from:investor});
            await increaseTime((await this.vault.refundStartTime()).toNumber());
            await increaseTime((await this.vault.REFUND_TIME_FRAME()).toNumber());
            await increaseTime(1);
            this.vault.close({from:owner});

            await this.vault.claimTokens( tokensAmount/2 ,{from:investor});

        });

        it('Should fail to claim while \'Active\'', async function() {
            console.log("1");
            let tokensAmount = ether(1);
            console.log("2");
            await this.vault.deposit(investor,tokensAmount, {value: value, from:owner});
            console.log("3");
            let tokensAmountActual = await this.vault.depositedToken(investor);
            console.log("4");
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)
            console.log("5");
            try {
                console.log("6");
                await this.vault.claimTokens(tokensAmount ,{from:investor});
                console.log("7");
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error claim without Refund or Close state")

        });

        it('Should fail if investor is \'0x0\'', async function() {

            let tokensAmount = ether(1);
            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            try {
                await this.vault.claimTokens(tokensAmount ,{from:0x0});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error if investor address is 0x0")

        });

        it('Should fail if investor is not the sender is the owner', async function() {

            let tokensAmount = ether(1);
            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            try {
                await this.vault.claimTokens(tokensAmount ,{from:walletTeam});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error if not investor address")

        });

        it('Should fail if tokensToClaim is 0', async function() {

            let tokensAmount = ether(1);
            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            try {
                await this.vault.claimTokens(0 ,{from:walletTeam});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error with tokensAmount is 0")

        });

        it('Should fail if investor try to claim more tokens then he has bought', async function() {

            let tokensAmount = ether(1);
            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            try {
                await this.vault.claimTokens(ether(101 * 500) ,{from:0x0});
            } catch (error) {
                return utils.ensureException(error);
            }

            assert(false, "did not throw with error if investor try to claim more tokens then he has bought")

        });

        it('Should decrease investor tokens balance according to token withdrawal', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            this.vault.enableRefunds({from:owner});

            await this.vault.claimTokens(tokensAmount ,{from:investor});

            tokensAmount = await this.token.balanceOf(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)
        });

        it('Should transfer the investor tokens according to claim amount', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount);

            this.vault.enableRefunds({from:owner});

            let result = ether(0.5);
            await this.vault.claimTokens(result , {from:investor});

            var invsetorTokensAmount = await this.token.balanceOf(investor);
            invsetorTokensAmount.should.be.bignumber.equal(result);

        });

        it('Should decrease investor ether balance according to token withdrawal proportion', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});

            this.vault.enableRefunds({from:owner});

            await this.vault.claimTokens(tokensAmount /2 , {from:investor});
            let investorETH = await this.vault.depositedETH(investor);
            investorETH.should.be.bignumber.equal(value/2)
        });

        it('Should send ether to sirin according to token withdrawal proportion', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});

            this.vault.enableRefunds({from:owner});
            let walletBalanceBefore = await web3.eth.getBalance(wallet);

            await this.vault.claimTokens(tokensAmount , {from:investor});
            let walletBalanceAfter = await web3.eth.getBalance(wallet);

            walletBalanceAfter.minus(walletBalanceBefore).should.be.bignumber.equal(value)
        });

        it('Should have \'TokensClaimed\' event', async function() {

            let tokensAmount = ether(100 * 500);

            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            this.vault.enableRefunds({from:owner});

            const {logs} = await this.vault.claimTokens(tokensAmount/2 ,{from:investor});
            const event = logs.find(e => e.event === "TokensClaimed")
            should.exist(event)

        });
    });

    describe('claimAllTokens', function() {

        beforeEach(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
        })

        it('Should claim all', async function() {

            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);
            tokensAmountActual.should.be.bignumber.equal(tokensAmount)

            this.vault.enableRefunds({from:owner});

            await this.vault.claimAllTokens({from:investor});

            var invsetorTokensAmount = await this.token.balanceOf(investor);
            invsetorTokensAmount.should.be.bignumber.equal(tokensAmount)
        });
    });
   
    describe('claimTokens', function(){
         beforeEach(async function() {
            this.token = await SirinSmartToken.new({from: owner});
            this.vault = await RefundVault.new(wallet, this.token.address,{from: owner});
        })
        
        it('allow only investor to claim tokens', async function() {
            let tokensAmount = ether(1);
            this.token.issue(this.vault.address, tokensAmount, {from: owner});
            this.token.disableTransfers(false, {from:owner});

            await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
            let tokensAmountActual = await this.vault.depositedToken(investor);

            this.vault.enableRefunds({from:owner});

            await this.vault.claimTokens(tokensAmountActual, {from:investor});

            var invsetorTokensAmount = await this.token.balanceOf(investor);
            invsetorTokensAmount.should.be.bignumber.equal(tokensAmount)
        })
        
         it('should throw if owner try to clain investor tokens', async function() {
            try {
                let tokensAmount = ether(1);
                this.token.issue(this.vault.address, tokensAmount, {from: owner});
                this.token.disableTransfers(false, {from:owner});

                await this.vault.deposit(investor, tokensAmount, {value: value, from:owner});
                let tokensAmountActual = await this.vault.depositedToken(investor);

                this.vault.enableRefunds({from:owner});

                await this.vault.claimTokens(tokensAmountActual, {from:owner});

            } catch (error) {
                return utils.ensureException(error);
            }
            assert(false, "did not throw with error if owner try to claim investor tokens")          
         
        })
    });
})
