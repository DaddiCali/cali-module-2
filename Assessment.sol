// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CaliBuyAndSell {
    address public owner;
    mapping(address => uint256) public accountBalances;

    event DiamondsDeposited(address indexed account, uint256 amount);
    event DiamondsWithdrawn(address indexed account, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    function depositDiamonds() external payable {
        accountBalances[msg.sender] += msg.value;
        emit DiamondsDeposited(msg.sender, msg.value);
    }

    function withdrawDiamonds(uint256 amount) external {
        require(accountBalances[msg.sender] >= amount, "Insufficient balance");
        accountBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit DiamondsWithdrawn(msg.sender, amount);
    }

    function transferDiamonds(address receiver, uint256 amount) external {
        require(accountBalances[msg.sender] >= amount, "Insufficient balance");
        accountBalances[msg.sender] -= amount;
        accountBalances[receiver] += amount;
        emit DiamondsDeposited(receiver, amount);
        emit DiamondsWithdrawn(msg.sender, amount);
    }

    function sellAllBalance() external {
        uint256 balance = accountBalances[msg.sender];
        require(balance > 0, "No diamonds to sell");
        accountBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        emit DiamondsWithdrawn(msg.sender, balance);
    }

    function getBalance(address account) external view returns (uint256) {
        return accountBalances[account];
    }

    // This function is for emergency use only, in case funds get stuck
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
