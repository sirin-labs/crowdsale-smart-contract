pragma solidity ^0.4.18;


import './crowdsale/FinalizableCrowdsale.sol';
import './math/SafeMath.sol';
import './SirinSmartToken.sol';


contract SirinCrowdsale is FinalizableCrowdsale {

    // =================================================================================================================
    //                                      Constants
    // =================================================================================================================
    // Max amount of known addresses of which will get SRN by 'Grant' method.
    uint256 public constant MAX_TOKEN_GRANTEES = 10;

    // SRN to ETH base rate
    uint256 public constant EXCHANGE_RATE = 500;

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

    // wallets address for 60% of SRN allocation
    address public walletFounder;   //10% of the total number of SRN tokens will be allocated to the founders and team
    address public walletOEM;       //10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation, SDK developers and rebate to device and Shield OS™ users
    address public walletBounties;  //5% of the total number of SRN tokens will be allocated to professional fees and Bounties
    address public walletReserve;   //35% of the total number of SRN tokens will be allocated to SIRIN LABS and as a reserve for the company to be used for future strategic plans for the created ecosystem

    // Funds collected outside the crowdsale in wei
    uint256 public fiatRaisedConvertedToWei;

    //Grantees - used for non-ether and presale bonus token generation
    address[] public presaleGranteesMapKeys;
    mapping (address => uint256) public presaleGranteesMap;

    // =================================================================================================================
    //                                      Events
    // =================================================================================================================
    event GrantAdded(address indexed _grantee, uint256 _amount);
    event GrantUpdated(address indexed _grantee, uint256 _oldAmount, uint256 _newAmount);
    event GrantDeleted(address indexed _grantee, uint256 _hadAmount);

    // =================================================================================================================
    //                                      Constructors
    // =================================================================================================================

    function SirinCrowdsale(uint256 _startTime, uint256 _endTime, address _wallet, address _walletFounder, address _walletOEM, address _walletBounties, address _walletReserve)
    Crowdsale(_startTime, _endTime, EXCHANGE_RATE, _wallet)
    {
        require(_walletFounder != address(0));
        require(_walletOEM != address(0));
        require(_walletBounties != address(0));
        require(_walletReserve != address(0));

        walletFounder = _walletFounder;
        walletOEM = _walletOEM;
        walletBounties = _walletBounties;
        walletReserve = _walletReserve;
    }

    // =================================================================================================================
    //                                      Impl Crowdsale
    // =================================================================================================================

    // @return the rate in SRN per 1 ETH according to the time of the tx and the SRN pricing program.
    // @Override
    function getRate() public view returns (uint256) {
        uint256 newRate = rate;

        if (now < (startTime + 24 hours)) {
            newRate = 1000;
        } else if (now < (startTime + 2 days)) {
            newRate = 950;
        } else if (now < (startTime + 3 days)) {
            newRate = 900;
        } else if (now < (startTime + 4 days)) {
            newRate = 855;
        } else if (now < (startTime + 5 days)) {
            newRate = 810;
        } else if (now < (startTime + 6 days)) {
            newRate = 770;
        } else if (now < (startTime + 7 days)) {
            newRate = 730;
        } else if (now < (startTime + 8 days)) {
            newRate = 690;
        } else if (now < (startTime + 9 days)) {
            newRate = 650;
        } else if (now < (startTime + 10 days)) {
            newRate = 615;
        } else if (now < (startTime + 11 days)) {
            newRate = 580;
        } else if (now < (startTime + 12 days)) {
            newRate = 550;
        } else if (now < (startTime + 13 days)) {
            newRate = 525;
        } else {
            newRate = EXCHANGE_RATE;
        }
        return newRate;
    }

    // =================================================================================================================
    //                                      Impl FinalizableCrowdsale
    // =================================================================================================================

    //@Override
    function finalization() internal onlyOwner {
        super.finalization();
        
        // granting bonuses for the pre crowdsale grantees:
        for(uint8 i=0; i < presaleGranteesMapKeys.length; i++){
            token.issue(presaleGranteesMapKeys[i], presaleGranteesMap[presaleGranteesMapKeys[i]]);
        }

        // Adding 60% of the total token supply (40% were generated during the crowdsale)
        // 40 * 2.5 = 100
        uint256 newTotalSupply = token.totalSupply().mul(250).div(100);

        // 10% of the total number of SRN tokens will be allocated to the founders and team
        token.issue(walletFounder, newTotalSupply.mul(10).div(100));

        // 10% of the total number of SRN tokens will be allocated to OEM’s, Operating System implementation,
        // SDK developers and rebate to device and Shield OS™ users
        token.issue(walletOEM, newTotalSupply.mul(10).div(100));

        // 5% of the total number of SRN tokens will be allocated to professional fees and Bounties
        token.issue(walletBounties, newTotalSupply.mul(5).div(100));

        // 35% of the total number of SRN tokens will be allocated to SIRIN LABS,
        // and as a reserve for the company to be used for future strategic plans for the created ecosystem
        token.issue(walletReserve, newTotalSupply.mul(35).div(100));

        // Re-enable transfers after the token sale.
        token.disableTransfers(false);
    }

    // =================================================================================================================
    //                                      Public Methods
    // =================================================================================================================
    // @return the total funds collected in wei(ETH and none ETH).
    function getTotalFundsRaised() public constant returns (uint256) {
        return fiatRaisedConvertedToWei.add(weiRaised);
    }

    // =================================================================================================================
    //                                      External Methods
    // =================================================================================================================
    /// @dev Adds/Updates address and token allocation for token grants.
    /// Granted tokens are allocated to non-ether, presale, buyers.
    /// @param _grantee address The address of the token grantee.
    /// @param _value uint256 The value of the grant.
    function addUpdateGrantee(address _grantee, uint256 _value) external onlyOwner onlyWhileSale{
        require(_grantee != address(0));
        require(_value > 0);

        // Adding new key if not presented:
        if(presaleGranteesMap[_grantee] == 0){
            require(presaleGranteesMapKeys.length < MAX_TOKEN_GRANTEES);
            presaleGranteesMapKeys.push(_grantee);
            GrantAdded(_grantee, _value);
        }
        else{
            GrantUpdated(_grantee, presaleGranteesMap[_grantee],_value);
        }

        presaleGranteesMap[_grantee] = _value;
    }

    /// @dev deletes entries from the grants list.
    /// @param _grantee address The address of the token grantee.
    function deleteGrantee(address _grantee) external onlyOwner onlyWhileSale {
        require(_grantee != address(0));
        require(presaleGranteesMap[_grantee] != 0);

        //delete from the map:
        delete presaleGranteesMap[_grantee];

        //delete from the array (keys):
        uint8 index;
        for(uint8 i=0; i < presaleGranteesMapKeys.length; i++){
            if(presaleGranteesMapKeys[i] == _grantee)
            {
                index = i;
                break;
            }
        }
        presaleGranteesMapKeys[index] = presaleGranteesMapKeys[presaleGranteesMapKeys.length-1];
        delete presaleGranteesMapKeys[presaleGranteesMapKeys.length-1];
        presaleGranteesMapKeys.length--;

        GrantDeleted(_grantee, presaleGranteesMap[_grantee]);
    }

    /// @dev Set funds collected outside the crowdsale in wei.
    /// funds are converted to wei using the market conversion rate of USD\ETH on the day on the purchase.
    /// @param _fiatRaisedConvertedToWei number of none eth raised.
    function setFiatRaisedConvertedToWei(uint256 _fiatRaisedConvertedToWei) external onlyOwner onlyWhileSale {
        fiatRaisedConvertedToWei = _fiatRaisedConvertedToWei;
    }
}
