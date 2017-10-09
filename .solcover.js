module.exports = {
    norpc: false,
    //testCommand: 'node --max-old-space-size=4096 node_modules\\\\.bin\\\\truffle test --network coverage',
    skipFiles: [
      '.\\contracts\\Migrations.sol',
      '.\\contracts\\Migrations.sol',
      '.\\contracts\\SirinCrowdsale.sol',
      '.\\contracts\\SirinSmartToken.sol',
      '.\\contracts\\bancor\\ISmartToken.sol',
      '.\\contracts\\crowdsale\\Crowdsale.sol',
      '.\\contracts\\crowdsale\\FinalizableCrowdsale.sol',
      '.\\contracts\\math\\Math.sol',
      '.\\contracts\\math\\SafeMath.sol',
      '.\\contracts\\ownership\\Ownable.sol',
      '.\\contracts\\token\\BasicToken.sol',
      '.\\contracts\\token\\ERC20.sol',
      '.\\contracts\\token\\ERC20Basic.sol',
      '.\\contracts\\token\\LimitedTransferToken.sol',
      '.\\contracts\\token\\MintableToken.sol',
      '.\\contracts\\token\\StandardToken.sol',
      '.\\contracts\\token\\VestedToken.sol'
    ]
}
