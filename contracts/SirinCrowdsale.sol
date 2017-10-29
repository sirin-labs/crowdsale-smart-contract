pragma solidity ^0.4.11;


import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';
import './SirinSmartToken.sol';


contract SirinCrowdsale is FinalizableCrowdsale {

    // =================================================================================================================
    //                                      Constants
    // =================================================================================================================
    //Max amount of known addresses of which will get SRN by 'Grant' method.
    uint256 public constant MAX_TOKEN_GRANTEES = 100;
    uint256 public constant BASE_RATE = 500;

    // =================================================================================================================
    //                                      Modifiers
    // =================================================================================================================
    /**
       * @dev Throws if called by any account other than the owner.
       */
    modifier onlyWhileSale() {
        require(now >= startTime && now<endTime);
        _;
    }

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    //wallet address for 60% SRN allocation
    address public _walletFounder;
    address public _walletOEM;
    address public _walletBounties;
    address public _walletReserve;
	
	//Funds collected outside the crowdsale in wei
	uint256 public _noneETHraised;

    //Grantees
    address[] public _granteesMapKeys;
    mapping (address => uint256) public _granteesMap;

    // =================================================================================================================
    //                                      Events
    // =================================================================================================================
    event GrantAdded(address indexed _grantee, uint256 _amount);
    event GrantUpdated(address indexed _grantee, uint256 _oldAmount, uint256 _newAmount);
    event GrantDeleted(address indexed _grantee, uint256 _hadAmount);
	
    // =================================================================================================================
    //                                      Constructors
    // =================================================================================================================

    function SirinCrowdsale(uint256 startTime,
    uint256 endTime,
    address wallet,
    address walletFounder,
    address walletOEM,
    address walletBounties,
    address walletReserve) Crowdsale(startTime, endTime, BASE_RATE, wallet){
        require(walletFounder != address(0));
        require(walletOEM != address(0));
        require(walletBounties != address(0));
        require(walletReserve != address(0));

        _walletFounder = walletFounder;
        _walletOEM = walletOEM;
        _walletBounties = walletBounties;
        _walletReserve = walletReserve;
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================

    // @return the rate with bonus according to the time of the tx strting from 1000 down to 500
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
    function finalization()  internal {

        //granting bonuses for the pre-ico grantees:
        for(uint i=0; i < _granteesMapKeys.length; i++){
            token.issue(_granteesMapKeys[i], _granteesMap[_granteesMapKeys[i]]);
        }

        uint256 newTotalSupply = SafeMath.div(SafeMath.mul(token.totalSupply(), 250), 100);

        //10% of the total number of SRN tokens will be allocated to the founders and
        token.issue(_walletFounder,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        //SDK developers and rebate to device and Shield OS™ users
        token.issue(_walletOEM,SafeMath.div(SafeMath.mul(newTotalSupply, 10),100));

        //5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        token.issue(_walletBounties, SafeMath.div(SafeMath.mul(newTotalSupply, 5), 100));

        //35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        //and as a reserve for the company to be used for future strategic plans for the created ecosystem,
        token.issue(_walletReserve, SafeMath.div(SafeMath.mul(newTotalSupply, 35), 100));

        // Re-enable transfers after the token sale.
        token.disableTransfers(false);

        isFinalized = true;
    }

    // =================================================================================================================
    //                                      External Methods
    // =================================================================================================================
    /// @dev Adds/Updates address for  granted tokens.
    /// @param _grantee address The address of the token grantee.
    /// @param _value uint256 The value of the grant.
    function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner onlyWhileSale{
        require(_grantee != address(0));
        require(_value > 0);
        require(_granteesMapKeys.length + 1 <= MAX_TOKEN_GRANTEES);

        //Adding new key if not presented:
        if(_granteesMap[_grantee] == 0){
            _granteesMapKeys.push(_grantee);
            GrantAdded(_grantee, _value);
        }
        else{
            GrantUpdated(_grantee, _granteesMap[_grantee],_value);
        }

        _granteesMap[_grantee] = _value;
    }

    /// @dev deletes address for granted tokens.
    /// @param _grantee address The address of the token grantee
    function deleteGrantee(address _grantee) external onlyOwner onlyWhileSale {
        require(_grantee != address(0));
        require(_granteesMap[_grantee] != 0);

        GrantDeleted(_grantee, _granteesMap[_grantee]);
        //delete from the map:
        delete _granteesMap[_grantee];

        //delete from the array (keys):
        uint index;
        for(uint i=0; i < _granteesMapKeys.length; i++){
            if(_granteesMapKeys[i] == _grantee)
            {
                index = i;
                break;
            }
        }
        _granteesMapKeys[index] = _granteesMapKeys[_granteesMapKeys.length-1];
        delete _granteesMapKeys[_granteesMapKeys.length-1];
        _granteesMapKeys.length--;
    }
	
	/// @dev Set funds collected outside the crowdsale in wei
	/// @param noneETHraised number of none eth raised 
	function setNoneEthRaised(uint256 noneETHraised) external onlyOwner onlyWhileSale{
		_noneETHraised = noneETHraised;
	}
	
	// @return totatl funds collected (  ETH and none ETH)
	function getTotalFundsRaised() public constant returns (uint256) {
		return _noneETHraised + weiRaised;
	}
}
