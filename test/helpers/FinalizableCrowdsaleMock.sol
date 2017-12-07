pragma solidity ^0.4.18;


import '../../contracts/crowdsale/FinalizableCrowdsale.sol';


contract FinalizableCrowdsaleMock is FinalizableCrowdsale {

	function FinalizableCrowdsaleMock(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, SirinSmartToken _token) public
  		Crowdsale(_startTime, _endTime, _rate, _wallet, _token)
  		FinalizableCrowdsale()
  	{
  	}

  	function finalization() internal {
    	isFinalized = true;
  	}
}
