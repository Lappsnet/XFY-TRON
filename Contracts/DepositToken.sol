// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MintToken.sol";

contract DepositManager {
    MintToken public token;
    uint256 public interestRate = 3; // 3% anual
    
    struct Deposit {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => Deposit) public deposits;
    
    event DepositMade(address indexed user, uint256 amount);
    event InterestPaid(address indexed user, uint256 interest);
    
    constructor(address _tokenAddress) {
        token = MintToken(_tokenAddress);
    }
    
    function makeDeposit(uint256 _amount) public {
        require(token.transferFrom(msg.sender, address(this), _amount), "Transferencia fallida");
        deposits[msg.sender].amount += _amount;
        deposits[msg.sender].timestamp = block.timestamp;
        emit DepositMade(msg.sender, _amount);
    }
    
    function withdrawDeposit() public {
        Deposit storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount > 0, "No hay depositos para retirar");
        
        uint256 timeHeld = block.timestamp - userDeposit.timestamp;
        uint256 interest = (userDeposit.amount * interestRate * timeHeld) / (365 days * 100);
        
        require(token.transfer(msg.sender, userDeposit.amount + interest), "Transferencia fallida");
        emit InterestPaid(msg.sender, interest);
        
        userDeposit.amount = 0;
        userDeposit.timestamp = 0;
    }
}

