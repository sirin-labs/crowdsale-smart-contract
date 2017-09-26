pragma solidity ^0.4.11;

import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';


contract SirinCrowdsale is FinalizableCrowdsale {

    function SirinCrowdsale(uint256 _startBlock,
    uint256 _endBlock,
    uint256 _rate,
    address _wallet)
    Crowdsale(_startBlock, _endBlock, _rate, _wallet) {
    }
    // =========================================
    // Crowdsale override
    // =========================================


    // @return the crowdsale rate with bonus
    function getRate() public returns (uint256) {

        //10% bonus within the first 24 hours
        uint firstStep = startTime + 24 hours;
        //5% bonus after the first 24 hours till 7 days
        uint secondStep = startTime + 7 days;

        uint256 newRate = rate;

        if(now < (firstStep)){
            newRate += SafeMath.div(rate, 10);
        }else if(now > firstStep && now < secondStep){
            newRate += SafeMath.div(rate, 20);
        }

        return newRate;
    }


    // =========================================
    // FinalizableCrowdsale override
    // =========================================


    function finalization() internal {

        uint256 strategicPartnershipTokens = SafeMath.div(SafeMath.mul(token.totalSupply, 15),10);

        token.issue(0x00130f1b288ebB1dC157261146bb1cB9EF33192c, strategicPartnershipTokens);

        // Re-enable transfers after the token sale.
        token.disableTransfers(false);

        isFinalized = true;

    }

}
