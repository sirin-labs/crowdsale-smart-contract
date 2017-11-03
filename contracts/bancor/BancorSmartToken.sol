pragma solidity ^0.4.11;

import '../token/MintableToken.sol';
import '../token/LimitedTransferToken.sol';
import './ISmartToken.sol';
import '../ownership/Ownable.sol';

/**
    BancorSmartToken
*/
contract BancorSmartToken is MintableToken, ISmartToken, LimitedTransferToken {

  // =================================================================================================================
  //                                      Impl ISmartToken
  // =================================================================================================================

  //@Override
  function disableTransfers(bool _disable) onlyOwner public {
      transfersEnabled = !_disable;
  }

  //@Override
  function issue(address _to, uint256 _amount) onlyOwner public {
      require(super.mint(_to, _amount));
      Issuance(_amount);
  }

  //@Override
  function destroy(address _from, uint256 _amount) public {

      require(msg.sender == _from || msg.sender == owner); // validate input

      balances[_from] = balances[_from].sub(_amount);
      totalSupply = totalSupply.sub(_amount);

      Destruction(_amount);
      Transfer(0x0, _from, _amount);
  }

  // =================================================================================================================
  //                                      Impl LimitedTransferToken
  // =================================================================================================================


  // Enable/Disable token transfer
  // Tokens will be locked in their wallets until the end of the Crowdsale.
  // @holder - token`s owner
  // @time - not used (framework unneeded functionality)
  //
  // @Override
  function transferableTokens(address holder, uint64 time) public constant returns (uint256) {
      require(transfersEnabled);
      return super.transferableTokens(holder, time);
  }
}
