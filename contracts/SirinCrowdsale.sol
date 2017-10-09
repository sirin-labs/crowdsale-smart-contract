pragma solidity ^0.4.11;


import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';


contract SirinCrowdsale is FinalizableCrowdsale {

<<<<<<< HEAD
  //TODO: CHANGE ADDRESS BEFORE PUBLISH!
  address constant private PRESALE_WALLET_ADDRESS = 0x4CD5E1dBD38e6bE70EFc86d775a659bf74300892;
  address constant private FOUNDER_WALLET_ADDRESS = 0x00803306C76b1bf476cdCe3b308e146Ee1D201B4;
  address constant private DEVELOPERS_ADDRESS = 0x00eB0E5f489d90455d7BF202fF1a638f510E276b;
  address constant private BOUNTIES_ADDRESS = 0x0059e796c5Bc1F15B9310a8461deBADDC8F8af21;
  address constant private SIRIN_LABS_RESERVE_ADDRESS = 0x00522Ea95d76DFC9AaA8A25B3DD33Ef2d5c86929;

=======
>>>>>>> e725520bc7d6cf7c5fd593317795114fb0af5563
    function SirinCrowdsale(uint256 _startTime,
      uint256 _endTime,
      uint256 _rate,
      address _wallet) Crowdsale(_startTime, _endTime, _rate, _wallet) {
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================

    // @return the crowdsale rate with bonus
    //
    // @Override
    function getRate() internal returns (uint256) {

        if (msg.sender == 0x4CD5E1dBD38e6bE70EFc86d775a659bf74300892) {
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

        uint256 newTotalSupply = SafeMath.div(SafeMath.mul(token.totalSupply(), 250), 100);

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to the founders and
        //team and will be gradually vested over a 12-month period
<<<<<<< HEAD
        token.issue(FOUNDER_WALLET_ADDRESS,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        //SDK developers and rebate to device and Shield OS™ users
        token.issue(DEVELOPERS_ADDRESS,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //12.5% from totalSupply which is 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        token.issue(BOUNTIES_ADDRESS, SafeMath.div(SafeMath.mul(newTotalSupply, 5), 100));

        //87.5% from totalSupply which is 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        //and as a reserve for the company to be used for future strategic plans for the created ecosystem,
        token.issue(SIRIN_LABS_RESERVE_ADDRESS, SafeMath.div(SafeMath.mul(newTotalSupply, 35), 100));
=======
        token.issue(0x00803306C76b1bf476cdCe3b308e146Ee1D201B4,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //25% from totalSupply which is 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        //SDK developers and rebate to device and Shield OS™ users
        token.issue(0x00eB0E5f489d90455d7BF202fF1a638f510E276b,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //12.5% from totalSupply which is 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        token.issue(0x0059e796c5Bc1F15B9310a8461deBADDC8F8af21, SafeMath.div(SafeMath.mul(newTotalSupply, 5), 100));

        //87.5% from totalSupply which is 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        //and as a reserve for the company to be used for future strategic plans for the created ecosystem,
        token.issue(0x00522Ea95d76DFC9AaA8A25B3DD33Ef2d5c86929, SafeMath.div(SafeMath.mul(newTotalSupply, 35), 100));
>>>>>>> e725520bc7d6cf7c5fd593317795114fb0af5563

        // Re-enable transfers after the token sale.
        token.disableTransfers(false);


        isFinalized = true;

    }

}
