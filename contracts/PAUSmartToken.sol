pragma solidity ^0.5.11;

/*========================================================================================

SafeMath Library

========================================================================================*/


library SafeMath {
    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }
    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;

        return c;
    }
    
    
}



/*========================================================================================

Ownable Library

========================================================================================*/


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}


/*========================================================================================

Mintable Library

========================================================================================*/

contract Mintable {
    mapping (address => bool) private _minters;
    address private _minteradmin;
    address public pendingMinterAdmin;


    modifier onlyMinterAdmin() {
        require (msg.sender == _minteradmin, "caller not a minter admin");
        _;
    }

    modifier onlyMinter() {
        require (_minters[msg.sender] == true, "can't perform mint");
        _;
    }

    modifier onlyPendingMinterAdmin() {
        require(msg.sender == pendingMinterAdmin);
        _;
    }


    constructor () public {
        _minteradmin = msg.sender;
        _minters[msg.sender] = true;
    }

    function minteradmin() public view returns (address) {
        return _minteradmin;
    }

}


contract TokenRecipient {
    function receiveApproval(address _from, uint256 _value, address _token, bytes memory _extraData) public;
}

contract PAUToken is  Ownable, Mintable{
    using SafeMath for uint256;
    
    //MAX_SUPPLY
    uint256 public constant MAX_SUPPLY = 11000000e18;
    
    uint256 public constant INITIAL_COLATERAL = 200000e18;
    uint256 public constant Marketing = 2000000e18;
    uint256 public constant LIQUIDITY_MINING = 3000000e18;
    uint256 public constant TREASURY = 2000000e18;
    uint256 public constant TEAM = 600000e18;
    uint256 public constant AIRDROPS = 3000000e18;
    
    address public constant  _walletMarketing = 0xDc9111DB04cE2Db377A3cFAB7E6867Da17164e1c;
    address _walletLiquidityMining  = 0xDc9111DB04cE2Db377A3cFAB7E6867Da17164e1c;
    address _walletTreasury  = 0xDc9111DB04cE2Db377A3cFAB7E6867Da17164e1c;
    address _walletTeam  = 0xDc9111DB04cE2Db377A3cFAB7E6867Da17164e1c;
    address _walletAirdrops  = 0xDc9111DB04cE2Db377A3cFAB7E6867Da17164e1c;
    
    //variables
    string public name;
    string public symbol;
    uint8 public decimals;
    
    
    //mappings
    mapping (address => uint256) private _balances;
    mapping (address => bool) private _buyonsale;
    mapping (address => uint256) private _lockedTime;
    mapping (address => uint256) private _cliff;
    mapping (address => uint256) private _amountonsale;
    mapping (address => uint256) private _timeonsale;
    mapping (address => mapping (address => uint256)) private _allowances;
    uint256 private _totalSupply;


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    event Freeze(address indexed from, uint256 amount);
    event Melt(address indexed from, uint256 amount);
    event MintFrozen(address indexed to, uint256 amount);
    event FrozenTransfer(address indexed from, address indexed to, uint256 value);

    constructor (string memory _name, string memory _symbol, uint8 _decimals) public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        mint(msg.sender, INITIAL_COLATERAL);
        mint(_walletMarketing, Marketing);
        _addToSale(_walletMarketing, Marketing, 1800 days, 0);
        mint(_walletLiquidityMining, LIQUIDITY_MINING); 
        _addToSale(_walletLiquidityMining, LIQUIDITY_MINING, 1800 days, 0);
        mint(_walletTreasury, TREASURY);
         _addToSale(_walletTreasury, TREASURY, 1800 days, 0);
        mint(_walletTeam, TEAM);
         _addToSale(_walletTeam, TEAM, 1800 days, 365 days);
        mint(_walletAirdrops, AIRDROPS);
         _addToSale(_walletAirdrops, AIRDROPS, 1800 days, 0);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(this), "can't transfer tokens to the contract address");
        require(amount <= _balances[msg.sender]);
        
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address _owner, address spender) public view returns (uint256) {
        return _allowances[_owner][spender];
    }

    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /* Approve and then communicate the approved contract in a single tx */
    function approveAndCall(address _spender, uint256 _value, bytes memory _extraData) public returns (bool) {
        TokenRecipient spender = TokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, address(this), _extraData);
            return true;
        } else {
            return false;
        }
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(this), "can't transfer tokens to the contract address");

        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount));
        return true;
    }


    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].add(addedValue));
        return true;
    }


    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].sub(subtractedValue));
        return true;
    }

    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        
       
        if(_lockedTime[sender] > 0){
            uint256 time =  now - _timeonsale[sender];
            uint256 am = _amountonsale[sender];
            uint256 frozen = 0;
            
            if(time < _cliff[sender]){
                frozen = am;
            }else if(time >= _cliff[sender] && time < _lockedTime[sender]){
                if(_buyonsale[sender]){
                 frozen = time.add(203 days);
                }
                uint256 temp = _lockedTime[sender] - _cliff[sender];
                uint256 available = frozen.mul(am).div(temp);
                frozen = am.sub(available);
            }
            
            require( (_balances[sender] - frozen) >= amount , "Tokens are Frozen" );
        }
        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);   
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");
        require(account != address(this), "ERC20: mint to the contract address");
        require(amount > 0, "ERC20: mint amount should be > 0");
        require((_totalSupply + amount) <= 11000000e18, "MAX_SUPPLY already reached");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(this), account, amount);
    }

    function _burn(address account, uint256 value) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(this), value);
    }
    


    function _approve(address _owner, address spender, uint256 value) internal {
        require(_owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[_owner][spender] = value;
        emit Approval(_owner, spender, value);
    }

    function addToSale(address ad, uint256 amount) external{
        require(ad == msg.sender, "Not sender");
       _addToSale( ad,  amount, 810 days, 60 days);
    }
    
    function _addToSale(address ad, uint256 amount, uint256 lockTime, uint256 cliff) internal{
         require(ad != address(0), "Address 0 participate on sale");
         
        if(!_buyonsale[ad] && amount < INITIAL_COLATERAL){
             _buyonsale[ad] = true;
        }
        _amountonsale[ad].add(amount);
        _timeonsale[ad] = now;
        _lockedTime[ad] = lockTime;
        _cliff[ad] = cliff;
        
    }

}


