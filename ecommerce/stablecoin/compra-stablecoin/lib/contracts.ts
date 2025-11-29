import { ethers } from "ethers";

// ABI simplificado de EuroToken (solo funciones necesarias)
export const EUROTOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() pure returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
] as const;

// Dirección por defecto (Anvil default - primera dirección de contrato)
const DEFAULT_EUROTOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Función para validar si una dirección es válida
function isValidEthereumAddress(address: string): boolean {
  if (!address) return false;
  const cleaned = address.trim().replace(/[\r\n\t]/g, '');
  return cleaned.length === 42 && 
         cleaned.toLowerCase().startsWith('0x') && 
         ethers.isAddress(cleaned);
}

// Función para obtener y validar la dirección del contrato
function getEuroTokenAddress(): string {
  // Leer la variable de entorno directamente
  let address = process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS;
  
  // Si la variable no existe o no es válida, usar el valor por defecto
  if (!address || !isValidEthereumAddress(address)) {
    console.warn(
      `⚠️ Variable NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS no válida o no configurada. ` +
      `Valor recibido: "${address}". Usando dirección por defecto: ${DEFAULT_EUROTOKEN_ADDRESS}`
    );
    return DEFAULT_EUROTOKEN_ADDRESS;
  }
  
  // Limpiar y normalizar la dirección
  const cleaned = address.trim().replace(/[\r\n\t]/g, '');
  
  // Validar una vez más después de limpiar
  if (!isValidEthereumAddress(cleaned)) {
    console.warn(
      `⚠️ Dirección no válida después de limpiar: "${cleaned}". Usando dirección por defecto.`
    );
    return DEFAULT_EUROTOKEN_ADDRESS;
  }
  
  return cleaned;
}

export function getEuroTokenContract(signerOrProvider: ethers.Provider | ethers.Signer) {
  const EUROTOKEN_ADDRESS = getEuroTokenAddress();
  
  // Normalizar la dirección a formato checksummed para evitar problemas
  const normalizedAddress = ethers.getAddress(EUROTOKEN_ADDRESS);
  
  // Deshabilitar ENS en el provider si es posible
  if ('getNetwork' in signerOrProvider) {
    try {
      // Intentar deshabilitar ENS
      (signerOrProvider as any).disableEns = true;
      (signerOrProvider as any)._disableEns = true;
    } catch (e) {
      // Ignorar errores
    }
  }
  
  // Crear el contrato usando la dirección directamente
  // Importante: usar la dirección normalizada para evitar que ethers.js
  // intente resolverla como nombre ENS
  const contract = new ethers.Contract(
    normalizedAddress,
    EUROTOKEN_ABI,
    signerOrProvider
  );
  
  return contract;
}

export function formatEurt(amount: bigint, decimals: number = 6): string {
  return ethers.formatUnits(amount, decimals);
}

export function parseEurt(amount: string, decimals: number = 6): bigint {
  return ethers.parseUnits(amount, decimals);
}

