pragma solidity ^0.4.18;

import '../math/SafeMath.sol';
import '../ownership/Claimable.sol';
import '../token/ERC20.sol';
import '../SirinSmartToken.sol';

/**
 * @title RefundVault
 * @dev This contract is used for storing TOKENS AND ETHER while a crowdsale is in progress for a period of 60 DAYS.
 * Investor can ask for a full/part refund for his ether against token. Once tokens are Claimed by the investor, they cannot be refunded.
 * After 60 days, all ether will be withdrawn from the vault`s wallet, leaving all tokens to be claimed by the their owners.
 **/
contract RefundVault is Claimable {
    using SafeMath for uint256;

    // =================================================================================================================
    //                                      Enums
    // =================================================================================================================

    enum State { Active, Refunding, Closed }

    // =================================================================================================================
    //                                      Members
    // =================================================================================================================

    // Refund time frame
    uint256 public constant REFUND_TIME_FRAME = 60 days;

    mapping (address => uint256) public depositedETH;
    mapping (address => uint256) public depositedToken;

    address public etherWallet;
    SirinSmartToken public token;
    State public state;
    uint256 public refundStartTime;

    // =================================================================================================================
    //                                      Events
    // =================================================================================================================

    event Active();
    event Closed();
    event Deposit(address indexed beneficiary, uint256 etherWeiAmount, uint256 tokenWeiAmount);
    event RefundsEnabled();
    event RefundedETH(address beneficiary, uint256 weiAmount);
    event TokensClaimed(address indexed beneficiary, uint256 weiAmount);

    // =================================================================================================================
    //                                      Modifiers
    // =================================================================================================================

    modifier isActiveState() {
        require(state == State.Active);
        _;
    }

    modifier isRefundingState() {
        require(state == State.Refunding);
        _;
    }
    
    modifier isCloseState() {
        require(state == State.Closed);
        _;
    }

    modifier isRefundingOrCloseState() {
        require(state == State.Refunding || state == State.Closed);
        _;
    }

    modifier  isInRefundTimeFrame() {
        require(refundStartTime <= now && refundStartTime + REFUND_TIME_FRAME > now);
        _;
    }

    modifier isRefundTimeFrameExceeded() {
        require(refundStartTime + REFUND_TIME_FRAME < now);
        _;
    }
    

    // =================================================================================================================
    //                                      Ctors
    // =================================================================================================================

    function RefundVault(address _etherWallet, SirinSmartToken _token) public {
        require(_etherWallet != address(0));
        require(_token != address(0));

        etherWallet = _etherWallet;
        token = _token;
        state = State.Active;
        Active();
    }

    // =================================================================================================================
    //                                      Public Functions
    // =================================================================================================================

    function deposit(address investor, uint256 tokensAmount) isActiveState onlyOwner public payable {

        depositedETH[investor] = depositedETH[investor].add(msg.value);
        depositedToken[investor] = depositedToken[investor].add(tokensAmount);

        Deposit(investor, msg.value, tokensAmount);
    }

    function close() isRefundingState onlyOwner isRefundTimeFrameExceeded public {
        state = State.Closed;
        Closed();
        etherWallet.transfer(this.balance);
    }

    function enableRefunds() isActiveState onlyOwner public {
        state = State.Refunding;
        refundStartTime = now;

        RefundsEnabled();
    }

    //@dev Refund ether back to the investor in returns of proportional amount of SRN
    //back to the Sirin`s wallet
    function refundETH(uint256 ETHToRefundAmountWei) isInRefundTimeFrame isRefundingState public {
        require(ETHToRefundAmountWei != 0);

        uint256 depositedTokenValue = depositedToken[msg.sender];
        uint256 depositedETHValue = depositedETH[msg.sender];

        require(ETHToRefundAmountWei <= depositedETHValue);

        uint256 refundTokens = ETHToRefundAmountWei.mul(depositedTokenValue).div(depositedETHValue);

        assert(refundTokens > 0);

        depositedETH[msg.sender] = depositedETHValue.sub(ETHToRefundAmountWei);
        depositedToken[msg.sender] = depositedTokenValue.sub(refundTokens);

        token.destroy(address(this),refundTokens);
        msg.sender.transfer(ETHToRefundAmountWei);

        RefundedETH(msg.sender, ETHToRefundAmountWei);
    }

    //@dev Transfer tokens from the vault to the investor while releasing proportional amount of ether
    //to Sirin`s wallet.
    //Can be triggerd by the investor only
    function claimTokens(uint256 tokensToClaim) isRefundingOrCloseState public {
        require(tokensToClaim != 0);
        
        address investor = msg.sender;
        require(depositedToken[investor] > 0);
        
        uint256 depositedTokenValue = depositedToken[investor];
        uint256 depositedETHValue = depositedETH[investor];

        require(tokensToClaim <= depositedTokenValue);

        uint256 claimedETH = tokensToClaim.mul(depositedETHValue).div(depositedTokenValue);

        assert(claimedETH > 0);

        depositedETH[investor] = depositedETHValue.sub(claimedETH);
        depositedToken[investor] = depositedTokenValue.sub(tokensToClaim);

        token.transfer(investor, tokensToClaim);
        if(state != State.Closed) {
            etherWallet.transfer(claimedETH);
        }

        TokensClaimed(investor, tokensToClaim);
    }
    
    // @dev investors can claim tokens by calling the function
    // @param tokenToClaimAmount - amount of the token to claim
    function claimAllTokens() isRefundingOrCloseState public  {
        uint256 depositedTokenValue = depositedToken[msg.sender];
        claimTokens(depositedTokenValue);
    }


}
