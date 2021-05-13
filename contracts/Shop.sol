pragma solidity ^0.7.4;

/* 
 * Import JUSD Token for use function in contract 
*/
import './JUSDToken.sol';

contract Shop {

    /* 
     *  # Shopping Contract
     *  Name : Shop
     *
     *  # Developer
     *  By : S.Waranat
    */

    uint public order_count = 0;
    
    mapping(uint => Order) public orders;
    mapping (uint256 => address[]) buying;

    JUSDToken token;

    constructor (address _tokenAddress) public {
        token = JUSDToken(_tokenAddress);
    }

    struct Order{
        uint order_id;
        mapping(uint => uint) items;
        uint item_count;
        address account;
        uint total;
    }

    /* 
     *  Function Onwer Balance 
     *  - For user check balance and show on homepage
     *  - when called will be use function in JUSD Token contract
    */
    function ownerBalance() public returns(uint){
      return token.ownerBalance();
    }

    /*
     *  Function createOrder
     *  - create order and transfer JUSD Token to dev account
    */
    function createOrder(uint[] memory ids, uint total) public {
        require(msg.sender != address(0));
        require(ids.length > 0);

        orders[order_count].order_id = order_count;
        orders[order_count].item_count = ids.length;
        orders[order_count].account = msg.sender;
        orders[order_count].total = total;

        for (uint i = 0; i < ids.length; i++){
          orders[order_count].items[i] = ids[i];
          token.transferFrom(msg.sender ,address(0), orders[order_count].total*100);
        }

        order_count ++;
        emit orderCreated(order_count, ids.length, total);
    }

    /*
     * Function getOrder
     * - For get order in blockchain and parse on homepage
    */
    function getOrder(uint id) public returns (uint order_id, uint item_count, address account, uint total){
        return (orders[id].order_id, orders[id].item_count, orders[id].account, orders[id].total);
    }

    function getItem(uint order_id, uint item_index) public returns (uint item_id){
        return (orders[order_id].items[item_index]);
    }

    event orderCreated (
        uint order_id,
        uint item_count,
        uint total
    );
}
