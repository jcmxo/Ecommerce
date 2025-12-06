import { ethers } from 'ethers';
import type {
  RPCRequest,
  RPCResponse,
  TransactionRequest,
  EIP712TypedData,
  PendingRequest,
  WalletState,
  Network,
} from './types';

// Estado de la wallet
let walletState: WalletState = {
  accounts: [],
  currentAccount: 0,
  currentChainId: '0x7a69', // 31337 - Hardhat default
  networks: [
    {
      chainId: '0x7a69',
      name: 'Hardhat Local',
      rpcUrl: 'http://localhost:8545',
    },
  ],
};

let pendingRequests: PendingRequest[] = [];
let requestResults = new Map<number, { result?: unknown; error?: Error }>();
let provider: ethers.JsonRpcProvider | null = null;

// Inicializar provider
function initProvider(rpcUrl: string) {
  provider = new ethers.JsonRpcProvider(rpcUrl);
}

// Cargar estado desde storage
async function loadWalletState(): Promise<void> {
  try {
    const result = await chrome.storage.local.get([
      'mnemonic',
      'accounts',
      'currentAccount',
      'currentChainId',
      'networks',
    ]);

    if (result.mnemonic) {
      walletState.mnemonic = result.mnemonic;
    }
    if (result.accounts) {
      walletState.accounts = result.accounts;
    }
    if (result.currentAccount !== undefined) {
      walletState.currentAccount = result.currentAccount;
    }
    if (result.currentChainId) {
      walletState.currentChainId = result.currentChainId;
    }
    if (result.networks) {
      walletState.networks = result.networks;
    }

    // Inicializar provider con la red actual
    const currentNetwork = walletState.networks.find(
      (n) => n.chainId === walletState.currentChainId
    );
    if (currentNetwork) {
      initProvider(currentNetwork.rpcUrl);
    } else if (walletState.networks.length > 0) {
      initProvider(walletState.networks[0].rpcUrl);
    }
  } catch (error) {
    console.error('Error loading wallet state:', error);
  }
}

// Guardar estado en storage
async function saveWalletState(): Promise<void> {
  try {
    await chrome.storage.local.set({
      mnemonic: walletState.mnemonic,
      accounts: walletState.accounts,
      currentAccount: walletState.currentAccount,
      currentChainId: walletState.currentChainId,
      networks: walletState.networks,
    });
  } catch (error) {
    console.error('Error saving wallet state:', error);
  }
}

// Derivar cuentas HD
function deriveAccounts(mnemonicPhrase: string, numAccounts: number): string[] {
  const mnemonicObj = ethers.Mnemonic.fromPhrase(mnemonicPhrase);
  const derivedAccounts: string[] = [];

  for (let i = 0; i < numAccounts; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObj, path);
    derivedAccounts.push(wallet.address);
  }

  return derivedAccounts;
}

// Obtener wallet para la cuenta actual
function getCurrentWallet(): ethers.HDNodeWallet | null {
  if (!walletState.mnemonic) return null;
  const mnemonicObj = ethers.Mnemonic.fromPhrase(walletState.mnemonic);
  const path = `m/44'/60'/0'/0/${walletState.currentAccount}`;
  return ethers.HDNodeWallet.fromMnemonic(mnemonicObj, path);
}

// Firmar transacción
async function signTransaction(tx: TransactionRequest): Promise<string> {
  const wallet = getCurrentWallet();
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }

  // Obtener chainId del estado de la wallet si no está en la transacción
  const chainId = tx.chainId 
    ? parseInt(tx.chainId, 16) 
    : parseInt(walletState.currentChainId, 16);

  // Construir la transacción manualmente
  // En ethers.js v6, podemos firmar directamente sin provider usando signTransaction
  const txRequest: ethers.TransactionRequest = {
    to: tx.to || null,
    value: tx.value ? BigInt(tx.value) : 0n,
    data: tx.data || '0x',
    gasLimit: tx.gas ? BigInt(tx.gas) : 21000n, // Gas por defecto para transferencias simples
    maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas
      ? BigInt(tx.maxPriorityFeePerGas)
      : undefined,
    nonce: tx.nonce ? parseInt(tx.nonce, 16) : 0, // Nonce por defecto (la dApp debería proporcionarlo)
    chainId: chainId,
  };

  // Firmar la transacción directamente usando la wallet
  // signTransaction puede trabajar sin provider si todos los campos están presentes
  const signedTx = await wallet.signTransaction(txRequest);
  
  // Extraer el hash de la transacción firmada
  // signedTx es una string serializada, necesitamos parsearla
  const txObj = ethers.Transaction.from(signedTx);
  const txHash = txObj.hash;
  
  if (!txHash) {
    throw new Error('Failed to get transaction hash from signed transaction');
  }
  
  return txHash;
}

// Firmar EIP-712
async function signTypedData(typedData: EIP712TypedData): Promise<string> {
  const wallet = getCurrentWallet();
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }

  const domain = typedData.domain;
  const types = typedData.types;
  const message = typedData.message;

  // Firmar usando ethers
  const signature = await wallet.signTypedData(domain, types, message);
  return signature;
}

// Handler de mensajes RPC
async function handleRPCRequest(request: RPCRequest): Promise<RPCResponse> {
  const { method, params, id } = request;

  try {
    switch (method) {
      case 'wallet_deriveAccounts': {
        const [mnemonic, numAccounts] = params as [string, number];
        const accounts = deriveAccounts(mnemonic, numAccounts);
        return { id, result: accounts, jsonrpc: '2.0' };
      }

      case 'wallet_getAccounts': {
        const currentAddr =
          walletState.accounts[walletState.currentAccount] || null;
        return {
          id,
          result: currentAddr ? [currentAddr] : [],
          jsonrpc: '2.0',
        };
      }

      case 'wallet_getAllAccounts': {
        return { id, result: walletState.accounts, jsonrpc: '2.0' };
      }

      case 'wallet_setCurrentAccount': {
        const [accountIndex] = params as [number];
        walletState.currentAccount = accountIndex;
        await saveWalletState();
        await notifyAccountsChanged();
        return { id, result: true, jsonrpc: '2.0' };
      }

      case 'wallet_setMnemonic': {
        const [mnemonic] = params as [string];
        walletState.mnemonic = mnemonic;
        await saveWalletState();
        return { id, result: true, jsonrpc: '2.0' };
      }

      case 'wallet_setAccounts': {
        const [accounts] = params as [string[]];
        walletState.accounts = accounts;
        walletState.currentAccount = 0;
        await saveWalletState();
        return { id, result: true, jsonrpc: '2.0' };
      }

      case 'wallet_getState': {
        // Asegurar que siempre retornamos un objeto válido
        const state = {
          mnemonic: walletState.mnemonic || undefined,
          accounts: walletState.accounts || [],
          currentAccount: walletState.currentAccount || 0,
          currentChainId: walletState.currentChainId || '0x7a69',
          networks: walletState.networks || [
            {
              chainId: '0x7a69',
              name: 'Hardhat Local',
              rpcUrl: 'http://localhost:8545',
            },
          ],
        };
        console.log('wallet_getState returning:', state);
        return { id, result: state, jsonrpc: '2.0' };
      }

      case 'wallet_reset': {
        walletState = {
          accounts: [],
          currentAccount: 0,
          currentChainId: '0x7a69',
          networks: [
            {
              chainId: '0x7a69',
              name: 'Hardhat Local',
              rpcUrl: 'http://localhost:8545',
            },
          ],
        };
        await chrome.storage.local.clear();
        return { id, result: true, jsonrpc: '2.0' };
      }

      case 'eth_sendTransaction': {
        const tx = params[0] as TransactionRequest;
        const requestId = Date.now();
        console.log('[Background] eth_sendTransaction recibido, creando requestId:', requestId);
        pendingRequests.push({
          id: requestId,
          method: 'eth_sendTransaction',
          params: [tx],
          timestamp: Date.now(),
        });
        console.log('[Background] Solicitud agregada a pendingRequests, total:', pendingRequests.length);
        await updateBadge();
        await openNotificationPage(requestId);
        console.log('[Background] Retornando respuesta con requestId:', requestId);
        return {
          id,
          result: { requestId, pending: true },
          jsonrpc: '2.0',
        };
      }

      case 'eth_signTypedData_v4': {
        const [address, typedDataStr] = params as [string, string];
        const typedData = JSON.parse(typedDataStr) as EIP712TypedData;
        const requestId = Date.now();
        pendingRequests.push({
          id: requestId,
          method: 'eth_signTypedData_v4',
          params: [address, typedData],
          timestamp: Date.now(),
        });
        await updateBadge();
        await openNotificationPage(requestId);
        return {
          id,
          result: { requestId, pending: true },
          jsonrpc: '2.0',
        };
      }

      case 'eth_chainId': {
        return { id, result: walletState.currentChainId, jsonrpc: '2.0' };
      }

      case 'eth_requestAccounts': {
        // Si no hay cuentas, abrir popup de conexión
        if (!walletState.accounts || walletState.accounts.length === 0) {
          // Abrir popup de conexión para que el usuario cree/restaure wallet
          await openConnectPage();
          // Retornar array vacío (la dApp debería esperar a que el usuario conecte)
          return { id, result: [], jsonrpc: '2.0' };
        }
        
        const currentAddr =
          walletState.accounts[walletState.currentAccount] || null;
        if (!currentAddr) {
          // Si hay cuentas pero currentAccount es inválido, usar la primera
          walletState.currentAccount = 0;
          await saveWalletState();
          return { id, result: [walletState.accounts[0]], jsonrpc: '2.0' };
        }
        return { id, result: [currentAddr], jsonrpc: '2.0' };
      }

      case 'eth_getBalance': {
        if (!provider) {
          throw new Error('Provider not initialized');
        }
        const [address] = params as [string];
        const balance = await provider.getBalance(address);
        return { id, result: '0x' + balance.toString(16), jsonrpc: '2.0' };
      }

      case 'notification_response': {
        const [requestId, approved] = params as [number, boolean];
        const pendingReq = pendingRequests.find((r) => r.id === requestId);
        if (!pendingReq) {
          throw new Error('Request not found');
        }

        if (approved) {
          try {
            if (pendingReq.method === 'eth_sendTransaction') {
              const tx = pendingReq.params[0] as TransactionRequest;
              console.log('[Background] Procesando transacción aprobada, requestId:', requestId);
              const txHash = await signTransaction(tx);
              console.log('[Background] Transacción firmada, txHash:', txHash);
              requestResults.set(requestId, { result: txHash });
              console.log('[Background] Result guardado en requestResults para requestId:', requestId);
              pendingRequests = pendingRequests.filter((r) => r.id !== requestId);
              await updateBadge();
              return { id, result: txHash, jsonrpc: '2.0' };
            } else if (pendingReq.method === 'eth_signTypedData_v4') {
              const [, typedData] = pendingReq.params as [string, EIP712TypedData];
              console.log('[Background] Procesando firma aprobada, requestId:', requestId);
              const signature = await signTypedData(typedData);
              console.log('[Background] Firma generada');
              requestResults.set(requestId, { result: signature });
              console.log('[Background] Result guardado en requestResults para requestId:', requestId);
              pendingRequests = pendingRequests.filter((r) => r.id !== requestId);
              await updateBadge();
              return { id, result: signature, jsonrpc: '2.0' };
            }
          } catch (error) {
            console.error('[Background] Error procesando solicitud aprobada:', error);
            requestResults.set(requestId, {
              error: error instanceof Error ? error : new Error('Unknown error'),
            });
            pendingRequests = pendingRequests.filter((r) => r.id !== requestId);
            await updateBadge();
            throw error;
          }
        } else {
          console.log('[Background] Solicitud rechazada por el usuario, requestId:', requestId);
          requestResults.set(requestId, {
            error: new Error('User rejected the request'),
          });
          console.log('[Background] Error guardado en requestResults para requestId:', requestId);
          pendingRequests = pendingRequests.filter((r) => r.id !== requestId);
          await updateBadge();
          throw new Error('User rejected the request');
        }
        return { id, result: null, jsonrpc: '2.0' };
      }

      case 'get_request_result': {
        const [requestId] = params as [number];
        console.log('[Background] get_request_result llamado para requestId:', requestId);
        console.log('[Background] requestResults keys:', Array.from(requestResults.keys()));
        const result = requestResults.get(requestId);
        if (!result) {
          console.log('[Background] Result not found para requestId:', requestId);
          throw new Error('Result not found');
        }
        if (result.error) {
          console.log('[Background] Result tiene error:', result.error.message);
          throw result.error;
        }
        console.log('[Background] Result encontrado:', result.result);
        // Limpiar resultado después de leerlo
        requestResults.delete(requestId);
        return { id, result: result.result, jsonrpc: '2.0' };
      }

      case 'get_pending_requests': {
        return { id, result: pendingRequests, jsonrpc: '2.0' };
      }

      case 'wallet_switchEthereumChain': {
        const [{ chainId }] = params as [{ chainId: string }];
        walletState.currentChainId = chainId;
        const network = walletState.networks.find((n) => n.chainId === chainId);
        if (network) {
          initProvider(network.rpcUrl);
        }
        await saveWalletState();
        await notifyChainChanged(chainId);
        return { id, result: null, jsonrpc: '2.0' };
      }

      case 'wallet_setChainId': {
        const [chainId] = params as [string];
        walletState.currentChainId = chainId;
        const network = walletState.networks.find((n) => n.chainId === chainId);
        if (network) {
          initProvider(network.rpcUrl);
        }
        await saveWalletState();
        await notifyChainChanged(chainId);
        return { id, result: true, jsonrpc: '2.0' };
      }

      case 'wallet_addNetwork': {
        const [network] = params as [Network];
        walletState.networks.push(network);
        await saveWalletState();
        return { id, result: true, jsonrpc: '2.0' };
      }

      default:
        throw new Error(`Method not supported: ${method}`);
    }
  } catch (error) {
    return {
      id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      jsonrpc: '2.0',
    };
  }
}

// Notificar cambio de cuentas a todas las pestañas
async function notifyAccountsChanged(): Promise<void> {
  const currentAddr = walletState.accounts[walletState.currentAccount] || null;
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'accountsChanged',
        accounts: currentAddr ? [currentAddr] : [],
      });
    }
  });
}

// Notificar cambio de red
async function notifyChainChanged(chainId: string): Promise<void> {
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'chainChanged',
        chainId,
      });
    }
  });
}

// Actualizar badge con número de solicitudes pendientes
async function updateBadge(): Promise<void> {
  const count = pendingRequests.length;
  if (count > 0) {
    await chrome.action.setBadgeText({ text: count.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: '#ff0000' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

// Abrir página de notificación
async function openNotificationPage(requestId: number): Promise<void> {
  try {
    const url = chrome.runtime.getURL('notification.html') + `?id=${requestId}`;
    console.log('[Background] Abriendo popup de notificación para requestId:', requestId, 'URL:', url);
    const window = await chrome.windows.create({
      url,
      type: 'popup',
      width: 400,
      height: 600,
    });
    console.log('[Background] Popup abierto exitosamente, windowId:', window?.id);
  } catch (error) {
    console.error('[Background] Error abriendo popup de notificación:', error);
    throw error;
  }
}

// Abrir página de conexión
async function openConnectPage(): Promise<void> {
  const url = chrome.runtime.getURL('connect.html');
  await chrome.windows.create({
    url,
    type: 'popup',
    width: 400,
    height: 600,
  });
}

// Listener de mensajes
chrome.runtime.onMessage.addListener(
  (message: RPCRequest, sender, sendResponse) => {
    console.log('[Background] Recibido mensaje RPC:', message.method, message.params);
    handleRPCRequest(message)
      .then((response) => {
        console.log('[Background] Enviando respuesta:', response);
        sendResponse(response);
      })
      .catch((error) => {
        console.error('[Background] Error procesando RPC:', error);
        sendResponse({
          id: message.id,
          error: {
            code: -32000,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          jsonrpc: '2.0',
        });
      });
    return true; // Mantener canal abierto para respuesta asíncrona
  }
);

// Inicializar al cargar el service worker
loadWalletState().catch((error) => {
  console.error('Error initializing wallet state:', error);
});

