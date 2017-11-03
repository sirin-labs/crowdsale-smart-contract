pragma solidity ^0.4.11;

import './bancor/BancorSmartToken.sol';

/**
  A Token which is 'Bancor' compatible and can mint new tokens and pause token-transfer functionality
*/
contract SirinSmartToken is BancorSmartToken  {

    // =================================================================================================================
    //                                           Members
    // =================================================================================================================

    string public name = "SIRIN LABS";
    string public symbol = "SRN";
    uint8 public decimals = 18;

    // =================================================================================================================
    //                                         Constructor
    // =================================================================================================================

    function SirinSmartToken() {
        //Apart of 'Bancor' computability - triggered when a smart token is deployed
        NewSmartToken(address(this));
    }
}
