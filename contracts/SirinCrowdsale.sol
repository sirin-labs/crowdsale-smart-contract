pragma solidity ^0.4.11;

import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';


contract SirinCrowdsale is FinalizableCrowdsale {

    function SirinCrowdsale(uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    address _wallet) Crowdsale(_startTime, _endTime, _rate, _wallet) {
    }

    // =========================================
    // Public Methods
    // =========================================

    // creates the token to be sold.
    // override this method to have crowdsale of a specific mintable token.
    function createTokenContract() internal returns (MintableToken) {
        return new SirinSmartToken();
    }

    function buyTokensWithoutBonus(address beneficiary) public payable {
        buyTokens(beneficiary, rate);
    }

    // =========================================
    // Crowdsale override
    // =========================================

    // @return the crowdsale rate with bonus
    function getRate() internal returns (uint256) {

        //10% bonus within the first 24 hours
        uint firstStep = startTime + 24 hours;
        //5% bonus after the first 24 hours till 7 days
        uint secondStep = firstStep + 6 days;

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

        uint256 totalSupply = token.totalSupply();

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to the founders and
        //team and will be gradually vested over a 12-month period
        ((SirinSmartToken)(token)).issue(0x00803306C76b1bf476cdCe3b308e146Ee1D201B4, SafeMath.div(SafeMath.mul(totalSupply, 250),1000));

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        //SDK developers and rebate to device and Shield OS™ users
        ((SirinSmartToken)(token)).issue(0x00eB0E5f489d90455d7BF202fF1a638f510E276b, SafeMath.div(SafeMath.mul(totalSupply, 250),1000));

        //12.5% from totalSupply which is 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        ((SirinSmartToken)(token)).issue(0x0059e796c5Bc1F15B9310a8461deBADDC8F8af21, SafeMath.div(SafeMath.mul(totalSupply, 125),1000));

        //87.5% from totalSupply which is 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        //and as a reserve for the company to be used for future strategic plans for the created ecosystem,
        ((SirinSmartToken)(token)).issue(0x00522Ea95d76DFC9AaA8A25B3DD33Ef2d5c86929, SafeMath.div(SafeMath.mul(totalSupply, 875),1000));

        // Re-enable transfers after the token sale.
        ((SirinSmartToken)(token)).disableTransfers(false);

        isFinalized = true;

    }

}
