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

    mapping (address => uint256) public depositedETH;
    mapping (address => uint256) public depositedToken;

    address public etherWallet;
    SirinSmartToken public token;
    State public state;

    // =================================================================================================================
    //                                      Events
    // =================================================================================================================

    event Closed();
    event RefundsEnabled();
    event RefundedETH(address beneficiary, uint256 weiAmount);
    event TokensClaimed(address indexed beneficiary, uint256 weiAmount);

    // =================================================================================================================
    //                                      Ctors
    // =================================================================================================================

    function RefundVault(address _etherWallet, SirinSmartToken _token) public {
        require(_etherWallet != address(0));

        etherWallet = _etherWallet;
        token = _token;
        state = State.Active;
    }

    // =================================================================================================================
    //                                      Public Functions
    // =================================================================================================================

    function deposit(address investor, uint256 tokensAmount) onlyOwner public payable {
        require(state == State.Active);

        depositedETH[investor] = depositedETH[investor].add(msg.value);
        depositedToken[investor] = depositedToken[investor].add(tokensAmount);
    }

    function close() onlyOwner public {
        require(state == State.Refunding);

        state = State.Closed;
        Closed();
        etherWallet.transfer(this.balance);
    }

    function enableRefunds() onlyOwner public {
        require(state == State.Active);
        state = State.Refunding;
        RefundsEnabled();
    }

    //@dev Refund ether back to the investor in returns of proportional amount of SRN
    //back to the Sirin`s wallet
    function refundETH(address investor, uint256 ETHToRefundAmountWei) public {

        require(state == State.Refunding);
        require(investor != address(0));
        require(ETHToRefundAmountWei != 0);
        require(tx.origin == investor); // validate input

        uint256 depositedTokenValue = depositedToken[investor];
        uint256 depositedETHValue = depositedETH[investor];

        if (ETHToRefundAmountWei > depositedETHValue) {
            revert();
        }

        uint256 refundTokens = ETHToRefundAmountWei.mul(depositedTokenValue).div(depositedETHValue);


        if(refundTokens == 0) {
            revert();
        }

        depositedETH[investor] = depositedETHValue.sub(ETHToRefundAmountWei);
        depositedToken[investor] = depositedTokenValue.sub(refundTokens);

        token.destroy(address(this),refundTokens);
        investor.transfer(ETHToRefundAmountWei);

        RefundedETH(investor, ETHToRefundAmountWei);
    }

    //@dev Transfer tokens from the vault to the investor while releasing proportional amount of ether
    //to Sirin`s wallet.
    //Can be triggerd by the investor or by the owner of the vault (in our case - Sirin`s owner after 60 days)
    function claimToken(address investor, uint256 tokensToClaim) public {
        require(state == State.Refunding || state == State.Closed);
        require(tokensToClaim != 0);
        require(investor != address(0));
        require(tx.origin == investor || msg.sender == owner); // validate input

        uint256 depositedTokenValue = depositedToken[investor];
        uint256 depositedETHValue = depositedETH[investor];

        if (tokensToClaim > depositedTokenValue) {
            revert();
        }

        uint256 claimedETH = tokensToClaim.mul(depositedETHValue).div(depositedTokenValue);
        if(claimedETH == 0) {
            revert();
        }

        depositedETH[investor] = depositedETHValue.sub(claimedETH);
        depositedToken[investor] = depositedTokenValue.sub(tokensToClaim);

        token.transfer(investor, tokensToClaim);
        if(state != State.Closed) {
            etherWallet.transfer(claimedETH);
        }

        TokensClaimed(investor, tokensToClaim);
    }
}