// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EuroToken
 * @dev ERC20 token representing digital euros (1 EURT = 1 EUR)
 * @notice Stablecoin backed 1:1 with EUR, perfect for stable transactions in the DeFi ecosystem
 */
contract EuroToken is ERC20, Ownable {
    /**
     * @dev Emitted when new tokens are minted
     * @param to Address receiving the tokens
     * @param amount Amount of tokens minted
     */
    event TokensMinted(address indexed to, uint256 amount);

    /**
     * @dev Constructor that sets up the token
     * @param initialOwner Address that will own the contract (can mint tokens)
     */
    constructor(address initialOwner) ERC20("EuroToken", "EURT") Ownable(initialOwner) {
        // No initial supply - tokens will be minted when purchased via Stripe
    }

    /**
     * @dev Returns the number of decimals used to get its user representation
     * @return Number of decimals (6 for representing cents)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @dev Mints new tokens to a specified address
     * @notice Only the owner (backend that processes Stripe payments) can call this
     * @param to Address that will receive the minted tokens
     * @param amount Amount of tokens to mint (in smallest unit, with 6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "EuroToken: cannot mint to zero address");
        require(amount > 0, "EuroToken: amount must be greater than zero");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burns tokens from caller's balance
     * @notice Allows token holders to burn their own tokens
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "EuroToken: amount must be greater than zero");
        _burn(msg.sender, amount);
    }
}

