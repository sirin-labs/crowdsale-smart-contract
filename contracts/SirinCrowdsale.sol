pragma solidity ^0.4.11;


import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';
import './SirinSmartToken.sol';


contract SirinCrowdsale is FinalizableCrowdsale {


    address public walletPresale;

    address public walletFounder;

    address public walletDeveloper;

    address public walletBounties;

    address public walletReserve;

    // =================================================================================================================
    //                                      Impl LimitedTransferToken
    // =================================================================================================================

    function SirinCrowdsale(uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    address _wallet,
    address _walletPresale,
    address _walletFounder,
    address _walletDeveloper,
    address _walletBounties,
    address _walletReserve) Crowdsale(_startTime, _endTime, _rate, _wallet){
        walletPresale = _walletPresale;
        walletFounder = _walletFounder;
        walletDeveloper = _walletDeveloper;
        walletBounties = _walletBounties;
        walletReserve = _walletReserve;
    }


    // =================================================================================================================
    //                                      Public Methods
    // =================================================================================================================

    // @Override
    function createTokenContract() internal returns (MintableToken) {
        return new SirinSmartToken();
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================

    // @return the crowdsale rate with bonus
    //
    // @Override
    function getRate() internal returns (uint256) {

        if (msg.sender == walletPresale) {
            return rate;
        }

        //10% bonus within the first 24 hours
        uint firstStep = startTime + 24 hours;
        //5% bonus after the first 24 hours till 7 days
        uint secondStep = firstStep + 6 days;

        uint256 newRate = rate;

        if (now < (firstStep)) {
            newRate += SafeMath.div(rate, 10);
        }
        else if (now > firstStep && now < secondStep) {
            newRate += SafeMath.div(rate, 20);
        }

        return newRate;
    }

    // =================================================================================================================
    //                                      Impl FinalizableCrowdsale
    // =================================================================================================================

    //@Override
    function finalization() internal {

        int256 newTotalSupply = SafeMath.div(((uint256)(SafeMath.mul(token.totalSupply(), 25))), 100);

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to the founders and
        //team and will be gradually vested over a 12-month period
        ((SirinSmartToken)(token)).issue(walletFounder, SafeMath.div(newTotalSupply, 10));

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        //SDK developers and rebate to device and Shield OS™ users
        ((SirinSmartToken)(token)).issue(walletDeveloper, SafeMath.div(newTotalSupply, 10));

        //12.5% from totalSupply which is 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        ((SirinSmartToken)(token)).issue(walletBounties, SafeMath.div(newTotalSupply, 5));

        //87.5% from totalSupply which is 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        //and as a reserve for the company to be used for future strategic plans for the created ecosystem,
        ((SirinSmartToken)(token)).issue(walletReserve, SafeMath.div(newTotalSupply, 35));

        // Re-enable transfers after the token sale.
        ((SirinSmartToken)(token)).disableTransfers(false);

        isFinalized = true;

    }

}
