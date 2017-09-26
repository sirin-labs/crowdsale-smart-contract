pragma solidity ^0.4.11;
//import './ITokenHolder.sol';
//import './IERC20Token.sol';

/*
    Smart Token interface
*/
contract ISmartToken {
    function disableTransfers(bool _disable) public;
    function issue(address _to, uint256 _amount) public;
    function destroy(address _from, uint256 _amount) public;
}