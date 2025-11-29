import { ethers } from "ethers";

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
  return provider;
}

export async function getWalletAddress(provider: ethers.BrowserProvider): Promise<string> {
  const signer = await provider.getSigner();
  return await signer.getAddress();
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

