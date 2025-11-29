/**
 * Utilidades para deshabilitar ENS en redes locales
 */

import { ethers } from "ethers";

/**
 * Deshabilita ENS en un provider para evitar errores en redes locales
 */
export function disableEnsForLocalNetwork(provider: ethers.Provider): void {
  try {
    // Intentar deshabilitar ENS de diferentes formas
    (provider as any).disableEns = true;
    (provider as any)._disableEns = true;
    
    // Sobrescribir métodos que intentan usar ENS
    const originalResolveName = (provider as any).resolveName?.bind(provider);
    if (originalResolveName) {
      (provider as any).resolveName = async (name: string) => {
        // Si es una dirección válida, devolverla directamente
        if (ethers.isAddress(name)) {
          return name;
        }
        // Si no, intentar resolver (pero probablemente fallará)
        try {
          return await originalResolveName(name);
        } catch (e) {
          // Si falla, devolver null en lugar de lanzar error
          return null;
        }
      };
    }
  } catch (e) {
    // Ignorar errores al intentar deshabilitar ENS
  }
}

/**
 * Verifica si estamos en una red local que no soporta ENS
 */
export async function isLocalNetwork(provider: ethers.Provider): Promise<boolean> {
  try {
    const network = await provider.getNetwork();
    // Chain ID 31337 es Anvil (blockchain local)
    return network.chainId === 31337n || network.name === "unknown";
  } catch (e) {
    return false;
  }
}

/**
 * Obtiene la dirección de una cuenta sin intentar resolver ENS
 */
export async function getAddressWithoutEns(
  provider: ethers.BrowserProvider
): Promise<string> {
  try {
    // Obtener cuenta directamente
    const accounts = await provider.send("eth_accounts", []);
    if (accounts && accounts.length > 0 && ethers.isAddress(accounts[0])) {
      return accounts[0];
    }
    
    // Fallback: usar signer
    const signer = await provider.getSigner();
    // Obtener la dirección directamente del signer sin resolver ENS
    return await signer.getAddress();
  } catch (err: any) {
    // Si hay error de ENS, intentar obtener directamente
    if (err?.code === "UNSUPPORTED_OPERATION") {
      try {
        const accounts = await provider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          return accounts[0];
        }
      } catch (fallbackErr) {
        throw new Error("No se pudo obtener la dirección de la wallet");
      }
    }
    throw err;
  }
}

