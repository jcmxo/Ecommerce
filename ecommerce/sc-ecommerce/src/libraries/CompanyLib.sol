// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title CompanyLib
 * @dev Librería para gestión de empresas en el e-commerce
 */
library CompanyLib {
    struct Company {
        uint256 companyId;
        string name;
        address companyAddress; // Wallet donde recibe pagos
        string taxId;
        bool isActive;
    }

    struct CompanyStorage {
        mapping(uint256 => Company) companies;
        mapping(address => uint256) addressToCompanyId;
        uint256 nextCompanyId;
    }

    error CompanyNotFound(uint256 companyId);
    error CompanyAlreadyExists(address companyAddress);
    error CompanyNotActive(uint256 companyId);
    error InvalidCompanyAddress();
    error NotCompanyOwner(uint256 companyId, address caller);

    /**
     * @dev Obtener el storage de companies
     */
    function getStorage() internal pure returns (CompanyStorage storage store) {
        bytes32 position = keccak256("ecommerce.companies");
        assembly {
            store.slot := position
        }
    }

    /**
     * @dev Registrar una nueva empresa
     */
    function registerCompany(
        CompanyStorage storage self,
        string memory name,
        address companyAddress,
        string memory taxId,
        address owner
    ) internal returns (uint256) {
        if (companyAddress == address(0)) {
            revert InvalidCompanyAddress();
        }

        // Verificar que la dirección no esté ya registrada
        if (self.addressToCompanyId[companyAddress] != 0) {
            revert CompanyAlreadyExists(companyAddress);
        }

        uint256 companyId = ++self.nextCompanyId;

        self.companies[companyId] = Company({
            companyId: companyId,
            name: name,
            companyAddress: companyAddress,
            taxId: taxId,
            isActive: true
        });

        self.addressToCompanyId[companyAddress] = companyId;
        self.addressToCompanyId[owner] = companyId; // Owner también puede gestionar

        return companyId;
    }

    /**
     * @dev Obtener información de una empresa
     */
    function getCompany(
        CompanyStorage storage self,
        uint256 companyId
    ) internal view returns (Company memory) {
        if (self.companies[companyId].companyId == 0) {
            revert CompanyNotFound(companyId);
        }
        return self.companies[companyId];
    }

    /**
     * @dev Obtener ID de empresa por dirección
     */
    function getCompanyIdByAddress(
        CompanyStorage storage self,
        address companyAddress
    ) internal view returns (uint256) {
        return self.addressToCompanyId[companyAddress];
    }

    /**
     * @dev Verificar si una dirección es de una empresa
     */
    function isCompanyOwner(
        CompanyStorage storage self,
        address account
    ) internal view returns (bool) {
        return self.addressToCompanyId[account] != 0;
    }

    /**
     * @dev Verificar si una empresa está activa
     */
    function isCompanyActive(
        CompanyStorage storage self,
        uint256 companyId
    ) internal view returns (bool) {
        Company memory company = getCompany(self, companyId);
        return company.isActive;
    }

    /**
     * @dev Desactivar una empresa
     */
    function deactivateCompany(
        CompanyStorage storage self,
        uint256 companyId,
        address caller
    ) internal {
        Company memory company = getCompany(self, companyId);
        
        if (!isCompanyOwner(self, caller)) {
            revert NotCompanyOwner(companyId, caller);
        }

        self.companies[companyId].isActive = false;
    }

    /**
     * @dev Activar una empresa
     */
    function activateCompany(
        CompanyStorage storage self,
        uint256 companyId,
        address caller
    ) internal {
        Company memory company = getCompany(self, companyId);
        
        if (!isCompanyOwner(self, caller)) {
            revert NotCompanyOwner(companyId, caller);
        }

        self.companies[companyId].isActive = true;
    }
}

