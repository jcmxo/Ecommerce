import { ethers } from "ethers";

// ABI simplificado de EuroToken
export const EUROTOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() pure returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
] as const;

// ABI simplificado de Ecommerce
export const ECOMMERCE_ABI = [
  "function processPayment(uint256 invoiceId)",
  "function getInvoice(uint256 invoiceId) view returns (tuple(uint256 invoiceId, address customer, uint256 companyId, tuple(uint256 productId, uint256 quantity, uint256 price, uint256 total)[] items, uint256 totalAmount, uint8 status, uint256 createdAt, uint256 paidAt))",
  "function getCompany(uint256 companyId) view returns (tuple(uint256 companyId, string name, address companyAddress, string taxId, bool isActive))",
] as const;

export function getEuroTokenContract(signerOrProvider: ethers.Provider | ethers.Signer, address: string) {
  return new ethers.Contract(address, EUROTOKEN_ABI, signerOrProvider);
}

export function getEcommerceContract(signerOrProvider: ethers.Provider | ethers.Signer, address: string) {
  return new ethers.Contract(address, ECOMMERCE_ABI, signerOrProvider);
}

export function formatEurt(amount: bigint, decimals: number = 6): string {
  return ethers.formatUnits(amount, decimals);
}

export function parseEurt(amount: string, decimals: number = 6): bigint {
  return ethers.parseUnits(amount, decimals);
}

