import { ethers } from "ethers";

// Direcciones de contratos desplegados (actualizadas después del deploy)
const DEFAULT_ECOMMERCE_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const DEFAULT_EUROTOKEN_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

// ABI completo de Ecommerce
export const ECOMMERCE_ABI = [
  // Company
  "function registerCompany(string memory name, address companyAddress, string memory taxId) external returns (uint256)",
  "function getCompany(uint256 companyId) view returns (tuple(uint256 companyId, string name, address companyAddress, string taxId, address owner, bool isActive, uint256 createdAt))",
  "function getCompanyIdByAddress(address companyAddress) view returns (uint256)",
  // Product
  "function addProduct(uint256 companyId, string memory name, string memory description, uint256 price, uint256 stock, string memory imageHash) external returns (uint256)",
  "function getProduct(uint256 productId) view returns (tuple(uint256 productId, uint256 companyId, string name, string description, uint256 price, uint256 stock, string imageHash, bool isActive, uint256 createdAt))",
  "function getCompanyProducts(uint256 companyId) view returns (uint256[])",
  "function updateStock(uint256 productId, uint256 newStock) external",
  // Invoice
  "function getInvoice(uint256 invoiceId) view returns (tuple(uint256 invoiceId, address customer, uint256 companyId, tuple(uint256 productId, uint256 quantity, uint256 price, uint256 total)[] items, uint256 totalAmount, uint8 status, uint256 createdAt, uint256 paidAt))",
  "function getCompanyInvoices(uint256 companyId) view returns (uint256[])",
  "function getCustomerInvoices() view returns (uint256[])",
] as const;

// ABI de EuroToken
export const EUROTOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() pure returns (uint8)",
] as const;

function getContractAddress(envVar: string, defaultValue: string): string {
  // Solo ejecutar en el cliente para evitar errores en el servidor
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  // En Next.js, las variables NEXT_PUBLIC_* están disponibles en el cliente
  let address: string | undefined;
  try {
    address = process.env[envVar];
  } catch (err) {
    // Ignorar errores al acceder a process.env
    address = undefined;
  }
  
  // Debug en desarrollo - siempre mostrar qué se está usando
  console.log(`[CONTRACT] ${envVar}:`, address || 'NOT SET');
  console.log(`[CONTRACT] Usando dirección:`, address || defaultValue);
  
  // Si no hay variable de entorno o no es válida, usar el valor por defecto
  if (!address || address.trim() === '') {
    console.warn(`⚠️ ${envVar} no está configurada o es inválida.`);
    console.warn(`⚠️ Valor recibido: "${address}"`);
    console.warn(`⚠️ Usando valor por defecto: ${defaultValue}`);
    return defaultValue;
  }
  
  // Validar y normalizar la dirección
  try {
    if (!ethers.isAddress(address)) {
      console.warn(`⚠️ ${envVar} contiene una dirección inválida: "${address}"`);
      console.warn(`⚠️ Usando valor por defecto: ${defaultValue}`);
      return defaultValue;
    }
    const normalizedAddress = ethers.getAddress(address);
    console.log(`✅ ${envVar} configurada correctamente: ${normalizedAddress}`);
    return normalizedAddress;
  } catch (err) {
    console.warn(`⚠️ Error al normalizar dirección de ${envVar}:`, err);
    return defaultValue;
  }
}

export function getEcommerceContract(signerOrProvider: ethers.Provider | ethers.Signer) {
  const address = getContractAddress(
    "NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS",
    DEFAULT_ECOMMERCE_ADDRESS
  );
  return new ethers.Contract(address, ECOMMERCE_ABI, signerOrProvider);
}

export function getEuroTokenContract(signerOrProvider: ethers.Provider | ethers.Signer) {
  const address = getContractAddress(
    "NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS",
    DEFAULT_EUROTOKEN_ADDRESS
  );
  return new ethers.Contract(address, EUROTOKEN_ABI, signerOrProvider);
}

export function formatEurt(amount: bigint, decimals: number = 6): string {
  return ethers.formatUnits(amount, decimals);
}

export function parseEurt(amount: string, decimals: number = 6): bigint {
  return ethers.parseUnits(amount, decimals);
}

