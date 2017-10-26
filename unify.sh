#!/bin/sh

rm -rf Unified.sol

function unify() {
	grep -v '^[pragma|import]' $1 >> Unified.sol
}

echo "pragma solidity ^0.4.11;" > Unified.sol

# OZ
unify ./contracts/math/Math.sol
unify ./contracts/math/SafeMath.sol
unify ./contracts/ownership/Ownable.sol
unify ./contracts/token/ERC20Basic.sol
unify ./contracts/token/ERC20.sol
unify ./contracts/token/BasicToken.sol
unify ./contracts/token/LimitedTransferToken.sol
unify ./contracts/token/StandardToken.sol
unify ./contracts/token/MintableToken.sol

unify ./contracts/bancor/ISmartToken.sol
unify ./contracts/SirinSmartToken.sol

# unify ./contracts/token/VestedToken.sol
unify ./contracts/crowdsale/Crowdsale.sol
unify ./contracts/crowdsale/FinalizableCrowdsale.sol


# Sirin
unify ./contracts/SirinCrowdsale.sol
