pragma solidity ^0.4.15;
import '../../contracts/token/StandardToken.sol';

/*
    Test token with predefined supply
*/
contract TestERC20Token is StandardToken {
    function TestERC20Token(uint256 _supply) {
        totalSupply = _supply;
        balances[msg.sender] = _supply;
    }
}
