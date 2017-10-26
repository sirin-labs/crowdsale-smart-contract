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

        uint day_1 = startTime + 24 hours;
        uint day_2 = day_1 + 24 hours;
        uint day_3 = day_2 + 24 hours;
        uint day_4 = day_3 + 24 hours;
        uint day_5 = day_4 + 24 hours;
        uint day_6 = day_5 + 24 hours;
        uint day_7 = day_6 + 24 hours;
        uint day_8 = day_7 + 24 hours;
        uint day_9 = day_8 + 24 hours;
        uint day_10 = day_9 + 24 hours;
        uint day_11 = day_10 + 24 hours;
        uint day_12 = day_11 + 24 hours;
        uint day_13 = day_12 + 24 hours;
        uint day_14 = day_13 + 24 hours;

        uint256 newRate = rate;

        if (now < (day_1)) {
            newRate = SafeMath.mul(rate, SafeMath.div(1000, 1000));
        }else if (now > day_1 && now < day_2) {
            newRate = SafeMath.mul(rate, SafeMath.div(950, 1000));
        }else if (now > day_2 && now < day_3) {
            newRate = SafeMath.mul(rate, SafeMath.div(900, 1000));
        }else if (now > day_3 && now < day_4) {
            newRate = SafeMath.mul(rate, SafeMath.div(855, 1000));
        }else if (now > day_4 && now < day_5) {
            newRate = SafeMath.mul(rate, SafeMath.div(810, 1000));
        }else if (now > day_5 && now < day_6) {
            newRate = SafeMath.mul(rate, SafeMath.div(770, 1000));
        }else if (now > day_6 && now < day_7) {
            newRate = SafeMath.mul(rate, SafeMath.div(730, 1000));
        }else if (now > day_7 && now < day_8) {
            newRate = SafeMath.mul(rate, SafeMath.div(690, 1000));
        }else if (now > day_8 && now < day_9) {
            newRate = SafeMath.mul(rate, SafeMath.div(650, 1000));
        }else if (now > day_9 && now < day_10) {
            newRate = SafeMath.mul(rate, SafeMath.div(615, 1000));
        }else if (now > day_10 && now < day_11) {
            newRate = SafeMath.mul(rate, SafeMath.div(580, 1000));
        }else if (now > day_11 && now < day_12) {
            newRate = SafeMath.mul(rate, SafeMath.div(550, 1000));
        }else if (now > day_12 && now < day_13) {
            newRate = SafeMath.mul(rate, SafeMath.div(525, 1000));
        }else if (now > day_13 && now < day_14) {
            newRate = SafeMath.mul(rate, SafeMath.div(500, 1000));
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
