pragma solidity ^0.7.4;

contract JUSDToken {

	/* 
	 *	# JUSD Token 
	 *	Name : Jack Stable Coin
	 *	TotalSupply : 100,000,000 Token
	 *	Decimals: 2 digits
	 *
	 *	# Developer
	 *	By : S.Waranat
	*/

	mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowance;

    uint public 	totalSupply 	= 10000000000 ;
	string public 	name 			= "JACK Stable Coin";
	string public 	symbol 			= "JUSD";
	uint public 	decimals 		= 2;

	/*
	 *	Constructure function for make first totalSupply
	*/
	constructor(){
    	balances[msg.sender] = totalSupply;
  	}

  	function ownerBalance() public returns(uint){
    	return balances[msg.sender];
	}

  	function balanceOf(address owner) public view returns(uint){
    	return balances[owner];
  	}

  	/*
  	 *	transfer - (Function)
  	 *	- This function use for transfer Token
  	*/
  	function transfer(address to, uint value) public returns(bool){
	    require(balanceOf(msg.sender) >= value, 'balance too low');
	    balances[to] += value;
	    balances[msg.sender] -= value;
	    emit Transfer(msg.sender, to, value);
	    return true;
  	}

  	/*
	 *	transferFrom - (Function)
	 *	-  This function reserve for wallet call for send JUSD token to another address
	 *	   with function send on web3 wallet (etc. metamask)
  	*/
  	function transferFrom(address _from, address _to, uint _value) public returns(bool success){
		    require(balances[_from] >= _value);                
	        require(balances[_to] + _value >= balances[_to]);
	        balances[_from] -= _value;
	        balances[_to] += _value;
	        emit Transfer(_from, _to, _value);
	        return true;
    }

    function approve(address spender, uint value) public returns(bool){
	        allowance[msg.sender][spender] = value;
	        emit Approve(msg.sender, spender, value);
	        return true;
    }

    /*
    *	Event Transfer with Transfer function
    */
    event Transfer(
    	address indexed from, 
    	address indexed to, 
    	uint value
    );

	event Approve(
		address indexed owner, 
		address indexed spender, 
		uint value
	);

}