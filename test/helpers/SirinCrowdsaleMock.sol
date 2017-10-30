pragma solidity ^0.4.11;

import '../../contracts/SirinCrowdsale.sol';

contract SirinCrowdsaleMock is SirinCrowdsale {

    event SirinCrowdsaleMockRate(uint256 rate);

    function SirinCrowdsaleMock(uint256 _startTime,
    uint256 _endTime,
    address _wallet,
    address _walletFounder,
    address _walletDeveloper,
    address _walletBounties,
    address _walletReserve)
        SirinCrowdsale(_startTime, _endTime, _wallet, walletFounder,_walletDeveloper, walletBounties, walletReserve) {

    }

    function getRateMock() public returns (uint) {
        var currentRate = getRate();
        SirinCrowdsaleMockRate(currentRate);
        return currentRate;
    }
}
