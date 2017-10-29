import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

//const SirinCrowdsale = artifacts.require('SirinCrowdsale.sol')
const SirinCrowdsale = artifacts.require('../helpers/SirinCrowdsaleMock.sol')
const SirinSmartToken = artifacts.require('SirinSmartToken.sol')

contract('SirinCrowdsale', function ([_,investor, owner, wallet, walletFounder, walletOEM, walletBounties, walletReserve]) {

  const value = ether(1)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);;
    this.endTime =   this.startTime + duration.weeks(1)
    this.afterEndTime = this.endTime + duration.seconds(1)

    this.crowdsale = await SirinCrowdsale.new(this.startTime,
      this.endTime,
      wallet,
      walletFounder,
      walletOEM,
      walletBounties,
      walletReserve,
      {from: owner})

    this.token = SirinSmartToken.at(await this.crowdsale.token())
  })

  describe('Rate Mechanism', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
    })

    it('Rate first day ', async function () {

      let rate = await this.crowdsale.getRateMock.call()
      console.log("Rate:" + rate);
      assert.equal(rate, 500);
    })
  })


  describe('Finalize allocation', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
    })

    it('Allocate founder token amount as 10% of the total supply', async function () {

      await this.crowdsale.sendTransaction({value: value, from: investor})

      await increaseTimeTo(this.afterEndTime)
      await this.crowdsale.finalize({from: owner})

      const totalSupply = await this.token.totalSupply()
      const expectedFounderTokenAmount =  totalSupply.div(10);
      let walletFounderBalance = await this.token.balanceOf(walletFounder);

      walletFounderBalance.should.be.bignumber.equal(expectedFounderTokenAmount);

    })
  })
})
