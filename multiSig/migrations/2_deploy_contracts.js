const MultisigWalletFactory = artifacts.require('MultiSigWalletFactory.sol')

module.exports = deployer => {
      deployer.deploy(MultisigWalletFactory)
}
