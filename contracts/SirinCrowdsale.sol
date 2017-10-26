pragma solidity ^0.4.11;


import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';
import './SirinSmartToken.sol';


contract SirinCrowdsale is FinalizableCrowdsale {

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
    address _walletFounder,
    address _walletDeveloper,
    address _walletBounties,
    address _walletReserve) Crowdsale(_startTime, _endTime, _rate, _wallet){
        walletFounder = _walletFounder;
        walletDeveloper = _walletDeveloper;
        walletBounties = _walletBounties;
        walletReserve = _walletReserve;
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================

    // @return the crowdsale rate with bonus
    //
    // @Override
    function getRate() internal returns (uint256) {
        uint256 newRate = rate;

        if (now < (24 hours)) {
            newRate = 1000;
        }else if (now < 2 days) {
            newRate = 950;
        }else if (now < 3 days) {
            newRate = 900;
        }else if (now < 4 days) {
            newRate = 855;
        }else if (now < 5 days) {
            newRate = 810;
        }else if (now < 6 days) {
            newRate = 770;
        }else if (now < 7 days) {
            newRate = 730;
        }else if (now < 8 days) {
            newRate = 690;
        }else if (now < 9 days) {
            newRate = 650;
        }else if (now < 10 days) {
            newRate = 615;
        }else if (now < 11 days) {
            newRate =580;
        }else if (now < 12 days) {
            newRate = 550;
        }else if (now < 13 days) {
            newRate = 525;
        }else if (now < 14 days) {
            newRate = 500;
        }else{
            newRate = 500;
        }


        return rate;
    }

    // =================================================================================================================
    //                                      Impl FinalizableCrowdsale
    // =================================================================================================================

    //@Override
    function finalization() internal {

        uint256 newTotalSupply = SafeMath.div(SafeMath.mul(token.totalSupply(), 250), 100);

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to the founders and
        //team and will be gradually vested over a 12-month period
        token.issue(walletFounder,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        //SDK developers and rebate to device and Shield OS™ users
        token.issue(walletDeveloper,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //12.5% from totalSupply which is 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        token.issue(walletBounties, SafeMath.div(SafeMath.mul(newTotalSupply, 5), 100));

        //87.5% from totalSupply which is 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        //and as a reserve for the company to be used for future strategic plans for the created ecosystem,
        token.issue(walletReserve, SafeMath.div(SafeMath.mul(newTotalSupply, 35), 100));

        // Re-enable transfers after the token sale.
        token.disableTransfers(false);

        isFinalized = true;
    }

}
