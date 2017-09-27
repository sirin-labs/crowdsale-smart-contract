pragma solidity ^0.4.11;

import './token/MintableToken.sol';
import './token/LimitedTransferToken.sol';
import './bancor/ISmartToken.sol';
import './ownership/Ownable.sol';

contract SirinSmartToken is MintableToken, ISmartToken, LimitedTransferToken  {

    // =========================================
    // Members
    // =========================================

    string public name = "Sirin Token";
    string public symbol = "SRN";
    uint public decimals = 18;

    // =========================================
    // Ctors
    // =========================================

    function SirinSmartToken() {
        NewSmartToken(address(this));
    }

    // =========================================
    // ISmartToken override
    // =========================================

    function disableTransfers(bool _disable) onlyOwner public {
        transfersEnabled = !_disable;
    }

    function issue(address _to, uint256 _amount) onlyOwner public {
        assert(super.mint(_to, _amount));
        Issuance(_amount);
    }

    function destroy(address _from, uint256 _amount) public {

        require(msg.sender == _from || msg.sender == owner); // validate input

        balances[_from] = balances[_from].sub(_amount);
        totalSupply = totalSupply.sub(_amount);

        Destruction(_amount);
        Transfer(0x0, _from, _amount);
    }

    // =========================================
    // LimitedTransferToken override
    // =========================================

    function transferableTokens(address holder, uint64 time) public constant returns (uint256) {
        assert(transfersEnabled);
        return super.transferableTokens(holder, time);
    }
}
