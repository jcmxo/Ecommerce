// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IEuroToken
 * @dev Interfaz para el token EuroToken
 */
interface IEuroToken is IERC20 {
    function decimals() external pure returns (uint8);
}

