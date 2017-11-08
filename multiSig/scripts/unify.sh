#!/bin/sh

UNIFIED="Unified.sol";
rm -rf Unified.sol

cd contracts/

UNIFIED_PATH="../$UNIFIED"

function unify() {
	grep -v '^[pragma|import]' $1 >> ../Unified.sol
}

echo "pragma solidity 0.4.18;" > ../Unified.sol

# OZ
unify ../contracts/Factory.sol
unify ../contracts/MultiSigWalletFactory.sol
unify ../contracts/MultiSigWallet.sol