# SIRIN LABS' Crowdsale Contracts

Please see below Sirin Labs smart contracts' for the [Sirin Crowdsale][sirinlabs].

![SirinLabs Token](images/logo.png)

SRN is an ERC-20 compliant cryptocurrency built on top of the [Ethereum][ethereum] blockchain.

## Overview
SIRIN LABS - the developer of SOLARIN, the ultra-secure smartphone - is holding a crowdsale event. Funds raised	will	support	the	development	of	FINNEY™,	the	first	open	source	smartphone	and	all-in-one	PC built for the blockchain era. Customers will be able to purchase all SIRIN LABS products (SOLARIN and FINNEY™) with SIRIN LABS token, the SRN.

## Contracts

Please see the [contracts/](contracts) directory.

## The Crowdsale Specification
*	Token will be ERC-20 compliant.
*	Token will be [Bancor][bancor] compliant
*	Token allocation:
	* 40% of the total number of SRN tokens will be allocated to contributors during the token sale
	* 10% of the total number of SRN tokens will be allocated to the founders and team and will be gradually vested over a 12-month period
	* 10% of the total number of SRN tokens will be allocated to OEMs, Operating System implementation, SDK developers and rebate of solds devices
	* 5% of the total number of SRN tokens will be allocated to professional fees and bounties
	* 35% of the total number of SRN tokens will be allocated to SIRIN LABS, to be used for future strategic plans and to develop the SIRIN LABS' ecosystem.


## Develop

Contracts are written in [Solidity][solidity] and tested using [Truffle][truffle] and [testrpc][testrpc].



## Code

#### Class Diagram  

![Class Diagram](images/SirinCrowdSale.jpg)



* Our smart contract is based on [Open Zeppelin's][openzeppelin] latest code
* Our token is Bancor compliant. We implemented Bancor functionality according to their guide.


#### Functions

**addUpdateGrantee**
```cs
function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner
```
Adds/Updates address for  granted tokens.


**deleteGrantee**
```cs
function deleteGrantee(address _grantee) external onlyOwner
```
Deletes address for granted tokens.



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
