pragma solidity ^0.4.18;

import '../math/SafeMath.sol';
import '../ownership/Ownable.sol';
import '../token/ERC20.sol';


/**
 * @title RefundVault
 * @dev This contract is used for storing funds while a crowdsale
 * is in progress. Supports refunding the money if crowdsale fails,
 * and forwarding it if crowdsale is successful.
 */
contract RefundVault is Ownable {
    using SafeMath for uint256;

    enum State { Active, Refunding, Closed }

    mapping (address => uint256) public depositedETH;
    mapping (address => uint256) public depositedToken;
    address public wallet;
    ERC20 public token;
    State public state;
    address public sirinBeneficiary;

    event Closed();
    event RefundsEnabled();
    event RefundedETH(address indexed beneficiary, uint256 weiAmount);
    event TokensClaimed(address indexed beneficiary, uint256 weiAmount);


    function RefundVault(address _wallet, ERC20 _token, address _sirinBeneficiary) public {
        require(_wallet != address(0));
        require(_sirinBeneficiary != address(0));

        wallet = _wallet;
        token = _token;
        sirinBeneficiary = _sirinBeneficiary;
        state = State.Active;
    }

    function deposit(address investor, uint256 tokensAmount) onlyOwner public payable {
        require(state == State.Active);
        depositedETH[investor] = depositedETH[investor].add(msg.value);
        depositedToken[investor] = depositedToken[investor].add(tokensAmount);
    }

    function close() onlyOwner public {
        require(state == State.Active);
        state = State.Closed;
        Closed();
        wallet.transfer(this.balance);
    }

    function enableRefunds() onlyOwner public {
        require(state == State.Active);
        state = State.Refunding;
        RefundsEnabled();
    }

    function refundETH(address investor) public {
        require(state == State.Refunding);
        require(investor != address(0));
        require(msg.sender == investor || msg.sender == owner); // validate input

        uint256 depositedValue = depositedETH[investor];
        uint256 depositedTokenValue = depositedToken[investor];

        depositedETH[investor] = 0;
        depositedToken[investor] = 0;

        token.transferFrom(address(this), sirinBeneficiary, depositedTokenValue);
        investor.transfer(depositedValue);

        RefundedETH(investor, depositedValue);
    }

    function claimToken(address investor, uint256 tokensToClaim) public {
        require(state == State.Refunding);
        require(tokensToClaim != 0);
        require(investor != address(0));
        require(msg.sender == investor || msg.sender == owner); // validate input

        uint256 depositedTokenValue = depositedToken[investor];
        uint256 depositedETHValue = depositedETH[investor];

        if (depositedTokenValue < tokensToClaim) {
            revert();
        }

        uint256 claimedETH = tokensToClaim.mul(depositedETHValue).div(depositedETHValue);

        depositedETH[investor] = claimedETH.sub(claimedETH);
        depositedToken[investor] = depositedTokenValue.sub(tokensToClaim);
        token.transferFrom(address(this), investor, tokensToClaim);
        wallet.transfer(claimedETH);
        TokensClaimed(investor, depositedTokenValue);
    }
}