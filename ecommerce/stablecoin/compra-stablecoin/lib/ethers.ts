import { ethers } from "ethers";
import { disableEnsForLocalNetwork, isLocalNetwork, getAddressWithoutEns } from "./ens-fix";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export async function connectWallet(): Promise<ethers.BrowserProvider | null> {
  if (!window.ethereum) {
    throw new Error("MetaMask no está instalado");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  
  // Deshabilitar ENS para redes locales
  if (await isLocalNetwork(provider)) {
    disableEnsForLocalNetwork(provider);
  }
  
  return provider;
}

export async function getWalletAddress(provider: ethers.BrowserProvider): Promise<string> {
  // Verificar si es red local y deshabilitar ENS
  if (await isLocalNetwork(provider)) {
    disableEnsForLocalNetwork(provider);
    return await getAddressWithoutEns(provider);
  }
  
  // Para redes públicas, usar el método normal
  try {
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (err: any) {
    // Fallback: obtener directamente
    return await getAddressWithoutEns(provider);
  }
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

