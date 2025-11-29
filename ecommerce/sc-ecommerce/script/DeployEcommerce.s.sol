// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Ecommerce} from "../src/Ecommerce.sol";

contract DeployEcommerce is Script {
    function run() external returns (Ecommerce) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Obtener dirección de EuroToken del ambiente
        address euroTokenAddress = vm.envAddress("EUROTOKEN_ADDRESS");
        if (euroTokenAddress == address(0)) {
            revert("EUROTOKEN_ADDRESS not set");
        }

        console.log("Deploying Ecommerce...");
        console.log("Deployer address:", deployer);
        console.log("EuroToken address:", euroTokenAddress);

        vm.startBroadcast(deployerPrivateKey);

        Ecommerce ecommerce = new Ecommerce(euroTokenAddress);

        console.log("Ecommerce deployed at:", address(ecommerce));

        vm.stopBroadcast();

        return ecommerce;
    }
}

