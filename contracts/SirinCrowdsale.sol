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

    uint256 public constant MAX_TOKEN_GRANTEES = 100;
    address[] public granteesMapKeys;
    mapping (address => uint256) public granteesMap;

    event GrantAdded(address indexed _grantee, uint256 _amount);
    event GrantUpdated(address indexed _grantee, uint256 _oldAmount, uint256 _newAmount);
    event GrantDeleted(address indexed _grantee, uint256 _hadAmount);

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
    function finalization()  internal {


        //granting bonuses for the pre-ico grantees:


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

    // =================================================================================================================
    //                                      External Methods
    // =================================================================================================================
    /// @dev Adds/Updates address for  granted tokens.
    /// @param _grantee address The address of the token grantee.
    /// @param _value uint256 The value of the grant.
    function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner {
        require(_grantee != address(0));
        require(_value > 0);
        require(granteesMapKeys.length + 1 <= MAX_TOKEN_GRANTEES);

        //Adding new key if not presented:
        if(granteesMap[_grantee] == 0){
            granteesMapKeys.push(_grantee);
            GrantAdded(_grantee, _value);
        }
        else{
            GrantUpdated(_grantee,granteesMap[_grantee],_value);
        }

        granteesMap[_grantee] = _value;
    }

    /// @dev deletes address for granted tokens.
    /// @param _grantee address The address of the token grantee
    function deleteGrantee(address _grantee){
        require(_grantee != address(0));
        require(granteesMap[_grantee] != 0);

        GrantDeleted(_grantee, granteesMap[_grantee]);
        //delete from the map:
        delete granteesMap[_grantee];

        //delete from the array (keys):
        //todo iterate and find the basterd
        uint index;
        for(uint i=0; i <= granteesMapKeys.length; i++){
            if(granteesMapKeys[i] == _grantee)
            {
                index = i;
                break;
            }
            throw; // todo think of this option
        }
        granteesMapKeys[index] = granteesMapKeys[granteesMapKeys.length-1];
        delete granteesMapKeys[granteesMapKeys.length-1];
        granteesMapKeys.length--;
    }
}
