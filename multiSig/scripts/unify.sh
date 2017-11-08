#!/bin/sh

rm -rf ../Unified.sol

function unify() {
	grep -v '^[pragma|import]' $1 >> ../Unified.sol
}

echo "pragma solidity 0.4.18;" > ../Unified.sol

# OZ
unify ../contracts/Factory.sol
unify ../contracts/MultiSigWalletFactory.sol
unify ../contracts/MultiSigWallet.sol