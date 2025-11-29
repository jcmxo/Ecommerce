// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {EuroToken} from "../src/EuroToken.sol";

contract EuroTokenTest is Test {
    EuroToken public euroToken;
    address public owner = address(1);
    address public user = address(2);
    address public nonOwner = address(3);

    uint256 constant INITIAL_MINT = 1_000_000 * 10**6; // 1,000,000 EURT with 6 decimals

    event TokensMinted(address indexed to, uint256 amount);

    function setUp() public {
        vm.prank(owner);
        euroToken = new EuroToken(owner);
    }

    function test_Deploy() public view {
        assertEq(euroToken.name(), "EuroToken");
        assertEq(euroToken.symbol(), "EURT");
        assertEq(euroToken.decimals(), 6);
        assertEq(euroToken.owner(), owner);
        assertEq(euroToken.totalSupply(), 0);
    }

    function test_Mint_ByOwner() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit TokensMinted(user, INITIAL_MINT);
        euroToken.mint(user, INITIAL_MINT);

        assertEq(euroToken.balanceOf(user), INITIAL_MINT);
        assertEq(euroToken.totalSupply(), INITIAL_MINT);
    }

    function test_Mint_ByNonOwner_Reverts() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        euroToken.mint(user, INITIAL_MINT);
    }

    function test_Mint_ToZeroAddress_Reverts() public {
        vm.prank(owner);
        vm.expectRevert("EuroToken: cannot mint to zero address");
        euroToken.mint(address(0), INITIAL_MINT);
    }

    function test_Mint_ZeroAmount_Reverts() public {
        vm.prank(owner);
        vm.expectRevert("EuroToken: amount must be greater than zero");
        euroToken.mint(user, 0);
    }

    function test_Transfer() public {
        // Mint tokens to user
        vm.prank(owner);
        euroToken.mint(user, INITIAL_MINT);

        // Transfer from user to nonOwner
        uint256 transferAmount = 100 * 10**6; // 100 EURT
        vm.prank(user);
        euroToken.transfer(nonOwner, transferAmount);

        assertEq(euroToken.balanceOf(user), INITIAL_MINT - transferAmount);
        assertEq(euroToken.balanceOf(nonOwner), transferAmount);
    }

    function test_Burn() public {
        // Mint tokens to user
        vm.prank(owner);
        euroToken.mint(user, INITIAL_MINT);

        // Burn tokens
        uint256 burnAmount = 500 * 10**6; // 500 EURT
        vm.prank(user);
        euroToken.burn(burnAmount);

        assertEq(euroToken.balanceOf(user), INITIAL_MINT - burnAmount);
        assertEq(euroToken.totalSupply(), INITIAL_MINT - burnAmount);
    }

    function test_Burn_ZeroAmount_Reverts() public {
        vm.prank(owner);
        euroToken.mint(user, INITIAL_MINT);

        vm.prank(user);
        vm.expectRevert("EuroToken: amount must be greater than zero");
        euroToken.burn(0);
    }

    function test_Decimals() public view {
        assertEq(euroToken.decimals(), 6);
    }

    function test_MultipleMints() public {
        uint256 mint1 = 100 * 10**6;
        uint256 mint2 = 200 * 10**6;
        uint256 mint3 = 300 * 10**6;

        vm.startPrank(owner);
        euroToken.mint(user, mint1);
        euroToken.mint(user, mint2);
        euroToken.mint(user, mint3);
        vm.stopPrank();

        assertEq(euroToken.balanceOf(user), mint1 + mint2 + mint3);
        assertEq(euroToken.totalSupply(), mint1 + mint2 + mint3);
    }
}

