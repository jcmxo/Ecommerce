// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {EuroToken} from "../src/EuroToken.sol";

contract DeployEuroToken is Script {
    function run() external returns (EuroToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying EuroToken...");
        console.log("Deployer address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        EuroToken euroToken = new EuroToken(deployer);

        console.log("EuroToken deployed at:", address(euroToken));
        console.log("Owner:", deployer);

        // Optional: Mint initial supply
        uint256 initialMint = 1_000_000 * 10**6; // 1,000,000 EURT with 6 decimals
        euroToken.mint(deployer, initialMint);
        console.log("Initial mint:", initialMint, "EURT");
        console.log("Deployer balance:", euroToken.balanceOf(deployer));

        vm.stopBroadcast();

        return euroToken;
    }
}

