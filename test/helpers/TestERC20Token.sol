pragma solidity ^0.4.18;
import '../../contracts/token/StandardToken.sol';

/*
    Test token with predefined supply
*/
contract TestERC20Token is StandardToken {
    function TestERC20Token(uint256 _supply) public{
        totalSupply = _supply;
        balances[msg.sender] = _supply;
    }
}
