// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 

contract FlashLoan is FlashLoanSimpleReceiverBase {
    using SafeMath for uint;
    event Log(address _asset, uint256 _value);
    
    constructor(IPoolAddressesProvider providor) FlashLoanSimpleReceiverBase(providor) {

    }

    function createFlashLoan(address _asset, uint _amount) external {
        address receiver = address(this);
        bytes memory params = ""; // this is neccesary to pass data to the executeOperation() 
        uint16 referralCode = 0;

        POOL.flashLoanSimple(receiver, _asset, _amount, params, referralCode);
    }

    function executeOperation(address _asset, uint256 _amount, uint256 _premium,address _initiator,bytes calldata _params) external returns(bool) {
        // this is the place where we write all our operations as to what
        // do we want to do with the loan money
        uint256 amountOwing = _amount.add(_premium);
        IERC20(_asset).approve(address(POOL), amountOwing);
        emit Log(_asset, amountOwing);
        return true;
    }

}