const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle, artifacts } = require("hardhat");
const hre = require("hardhat");

const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../utils/config");

describe("Deploy the flash loan smart contract", function () {
  it("Should take a flash loan and return it in the same txn", async function () {
    const flashLoanFactory = await ethers.getContractFactory("FlashLoan");
    // get the Pool address providor from https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
    const flashLoan = await flashLoanFactory.deploy(POOL_ADDRESS_PROVIDER);

    await flashLoan.deployed();

    // Get the contract and pass in the asset with it
    const token = await ethers.getContractAt("IERC20", DAI);
    const balanceAmountDai = ethers.utils.parseEther("2000");

    // Now impersonating a whale so that we send transactions with it as if it is our own wallet

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    const signer = await ethers.getSigner(DAI_WHALE);
    await token.connect(signer).transfer(flashLoan.address, balanceAmountDai); // // Sends our contract 2000 DAI from the DAI_WHALE

    const tx = await flashLoan.createFlashLoan(DAI, 500000); // Calling the flashloan function to borrow 500k Dai with no collateral
    await tx.wait();
    const remainingBalance = await token.balanceOf(flashLoan.address); // Check the balance of DAI in the Flash Loan contract afterwards
    expect(remainingBalance.lt(balanceAmountDai)).to.be.true; // We must have less than 2000 DAI now, since the premium was paid from our contract's balance
  });
});
