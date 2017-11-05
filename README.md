# SIRIN LABS' Crowdsale Contracts

Please see below Sirin Labs smart contracts' for the [Sirin Crowdsale][sirinlabs].

![SirinLabs Token](images/logo.png)

SRN is an ERC-20 compliant cryptocurrency built on top of the [Ethereum][ethereum] blockchain.

## Overview
SIRIN LABS - the developer of SOLARIN, the ultra-secure smartphone - is holding a crowdsale event. Funds raised	will	support	the	development	of	FINNEY™,	the	first	open	source	smartphone	and	all-in-one	PC built for the blockchain era. Customers will be able to purchase all SIRIN LABS products (SOLARIN and FINNEY™) with SIRIN LABS token, the SRN.

## Contracts

Please see the [contracts/](contracts) directory.

## The Crowdsale Specification
*	SRN token is ERC-20 compliant.
*	SRN Token is [Bancor][bancor] compliant.
*	Token allocation:
	* 40% of the total number of SRN tokens will be allocated to contributors during the token sale.
	* 10% of the total number of SRN tokens will be allocated to the founders and team and will be gradually vested over a 12-month period.
	* 10% of the total number of SRN tokens will be allocated to OEMs, Operating System implementation, SDK developers and rebate of sold devices.
	* 5% of the total number of SRN tokens will be allocated to professional fees and bounties.
	* 35% of the total number of SRN tokens will be allocated to SIRIN LABS, to be used for future strategic plans and to develop the SIRIN LABS' ecosystem.

## SRN PRICING PROGRAM

| Duration from token Crowdsale event start	| SRN / ETH |
| :---: | :---: |
| First 24 hours | 1000 |
| 2nd day | 950 |
| 3rd day | 900 |
| 4th day | 855 |
| 5th day | 810 |
| 6th day | 770 |
| 7th day | 730 |
| 8th day | 690 |
| 9th day | 650 |
| 10th day | 615 |
| 11th day | 580 |
| 12th day | 550 |
| 13th day | 525 |
| 14th day | 500 |

## Develop

* Contracts are written in [Solidity][solidity] and tested using [Truffle][truffle] and [testrpc][testrpc].

* Our smart contract is based on [Open Zeppelin][openzeppelin] smart contracts [v1.3.0][openzeppelin_v1.3.0] (latest OZ commit merged is 8e01dd14f9211239213ae7bd4c6af92dd18d4ab7 from 24.10.2017).

* SRN token is a **SmartToken™**, implementing Bancor's SmartToken contract.
## Code

#### Class Diagram  

![Class Diagram](images/SirinCrowdSale.jpg)


#### Functions

**getRate**
```cs
function getRate() public returns (uint256) 
```
Returns the rate in SRN per 1 ETH according to the time of the tx and the SRN pricing program.

**getTotalFundsRaised**
```cs
function getTotalFundsRaised() public constant returns (uint256) 
```
Returns the total funds collected in wei(ETH and none ETH).

**addUpdateGrantee**
```cs
function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner
```
Adds/Updates address and token allocation for token grants.

Granted tokens are allocated to non-ether, presale, buyers.


**deleteGrantee**
```cs
function deleteGrantee(address _grantee) external onlyOwner
```
Deletes entries from the grants list.

**setFiatRaisedConvertedToWei**
```cs
function setFiatRaisedConvertedToWei(uint256 _fiatRaised) external onlyOwner onlyWhileSale 
```
Sets funds collected outside the crowdsale in wei.
funds are converted to wei using the market conversion rate of USD\ETH on the day on the purchase.

#### Events

**GrantAdded**
```cs
event GrantAdded(address indexed _grantee, uint256 _amount);
```


**GrantUpdated**
```cs
event GrantUpdated(address indexed _grantee, uint256 _oldAmount, uint256 _newAmount);
```


**GrantDeleted**
```cs
event GrantDeleted(address indexed _grantee, uint256 _hadAmount);
```


### Dependencies

```bash
# Install Truffle and testrpc packages globally:
$ npm install -g truffle ethereumjs-testrpc

# Install local node dependencies:
$ npm install
```

### Test

```bash
$ ./scripts/test.sh
```


### Code Coverage

```bash
$ ./scripts/coverage.sh
```

## Collaborators

* **[Yossi Gruner](https://github.com/yossigruner)**
* **[Gilad Or](https://github.com/gilador)**
* **[Yaron Shlomo](https://github.com/yaronshlomo)**




## License

Apache License v2.0


[sirinlabs]: https://www.sirinlabs.com
[ethereum]: https://www.ethereum.org/

[solidity]: https://solidity.readthedocs.io/en/develop/
[truffle]: http://truffleframework.com/
[testrpc]: https://github.com/ethereumjs/testrpc
[bancor]: https://github.com/ethereumjs/testrpc
[openzeppelin]: https://openzeppelin.org
[openzeppelin_v1.3.0]: https://github.com/OpenZeppelin/zeppelin-solidity/releases/tag/v1.3.0
