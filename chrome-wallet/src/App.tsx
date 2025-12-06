import { useState, useEffect } from 'react';
import './App.css';

interface WalletState {
  mnemonic?: string;
  accounts: string[];
  currentAccount: number;
  currentChainId: string;
  networks: Array<{
    chainId: string;
    name: string;
    rpcUrl: string;
  }>;
}

interface LogEntry {
  timestamp: number;
  type: 'rpc' | 'event' | 'error' | 'operation';
  message: string;
  data?: unknown;
}

function App() {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [mnemonic, setMnemonic] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    loadWalletState();
    loadLogs();
  }, []);

  // Polling de balance cada 5 segundos
  useEffect(() => {
    if (walletState?.accounts[walletState.currentAccount]) {
      updateBalance();
      const interval = setInterval(updateBalance, 5000);
      return () => clearInterval(interval);
    }
  }, [walletState?.currentAccount]);

  // Función para enviar RPC al background
  async function sendRPC(method: string, params: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      console.log(`[RPC] Sending: ${method}`, params);
      
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        const error = 'chrome.runtime is not available';
        console.error(error);
        reject(new Error(error));
        return;
      }
      
      chrome.runtime.sendMessage(
        {
          id: Date.now(),
          method,
          params,
          jsonrpc: '2.0',
        },
        (response) => {
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError.message;
            console.error(`[RPC] Error for ${method}:`, error);
            reject(new Error(error));
            return;
          }
          
          if (!response) {
            const error = 'No response from background';
            console.error(`[RPC] ${error} for ${method}`);
            reject(new Error(error));
            return;
          }
          
          if (response.error) {
            console.error(`[RPC] Error response for ${method}:`, response.error);
            reject(new Error(response.error.message || 'Unknown error'));
            return;
          }
          
          console.log(`[RPC] Response for ${method}:`, response.result);
          resolve(response.result);
        }
      );
    });
  }

  // Restaurar cuentas desde mnemonic guardado
  async function restoreAccountsFromMnemonic(): Promise<void> {
    try {
      addLog('operation', 'Restoring accounts from saved mnemonic...');
      const state = (await sendRPC('wallet_getState', [])) as WalletState;
      
      if (!state?.mnemonic) {
        addLog('error', 'No mnemonic found to restore from');
        return;
      }
      
      // Derivar cuentas desde el mnemonic guardado
      const accounts = (await sendRPC('wallet_deriveAccounts', [
        state.mnemonic,
        5,
      ])) as string[];
      
      // Guardar las cuentas
      await sendRPC('wallet_setAccounts', [accounts]);
      addLog('operation', `✅ Restored ${accounts.length} accounts from mnemonic`);
      
      // Recargar el estado
      await loadWalletState();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog('error', `Error restoring accounts: ${errorMsg}`);
    }
  }

  // Cargar estado de wallet
  async function loadWalletState(): Promise<void> {
    try {
      addLog('operation', 'Loading wallet state...');
      console.log('Sending wallet_getState request...');
      
      const state = (await sendRPC('wallet_getState', [])) as WalletState;
      
      console.log('Wallet state received:', state);
      console.log('State details:', {
        hasMnemonic: !!state?.mnemonic,
        accountsCount: state?.accounts?.length || 0,
        accounts: state?.accounts,
        currentAccount: state?.currentAccount,
      });
      
      addLog('operation', `State received: mnemonic=${!!state?.mnemonic}, accounts=${state?.accounts?.length || 0}`);
      
      // Verificar si hay datos válidos
      const hasMnemonic = state?.mnemonic && state.mnemonic.trim().length > 0;
      const hasAccounts = state?.accounts && state.accounts.length > 0;
      
      // Si hay mnemonic pero no cuentas, restaurarlas
      if (hasMnemonic && !hasAccounts) {
        addLog('operation', '⚠️ Mnemonic found but no accounts. Restoring...');
        await restoreAccountsFromMnemonic();
        return; // loadWalletState se llamará de nuevo desde restoreAccountsFromMnemonic
      }
      
      if (state && (hasMnemonic || hasAccounts)) {
        // Asegurar que el estado tenga todos los campos necesarios
        const completeState: WalletState = {
          mnemonic: state.mnemonic,
          accounts: state.accounts || [],
          currentAccount: state.currentAccount ?? 0,
          currentChainId: state.currentChainId || '0x7a69',
          networks: state.networks || [
            {
              chainId: '0x7a69',
              name: 'Hardhat Local',
              rpcUrl: 'http://localhost:8545',
            },
          ],
        };
        
        setWalletState(completeState);
        if (completeState.mnemonic) {
          setMnemonic(completeState.mnemonic);
        }
        addLog('operation', `✅ Wallet loaded: ${completeState.accounts.length} accounts`);
        console.log('Wallet state set:', completeState);
      } else {
        addLog('operation', '⚠️ No wallet found, showing setup screen');
        console.log('No wallet data found. State:', state);
        setWalletState(null);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog('error', `❌ Error loading wallet: ${errorMsg}`);
      console.error('Error loading wallet state:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      // Si hay error, mostrar pantalla de setup
      setWalletState(null);
    }
  }

  // Cargar logs desde storage
  async function loadLogs(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['logs']);
      if (result.logs) {
        setLogs(result.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }

  // Guardar logs
  async function saveLogs(newLogs: LogEntry[]): Promise<void> {
    try {
      await chrome.storage.local.set({ logs: newLogs });
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }

  // Agregar log
  function addLog(type: LogEntry['type'], message: string, data?: unknown): void {
    const newLog: LogEntry = {
      timestamp: Date.now(),
      type,
      message,
      data,
    };
    const updatedLogs = [...logs, newLog].slice(-100); // Mantener últimos 100
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  }

  // Generar nuevo mnemonic
  async function generateMnemonic(): Promise<void> {
    try {
      addLog('operation', 'Generating new mnemonic...');
      console.log('[generateMnemonic] Starting...');
      const { ethers } = await import('ethers');
      console.log('[generateMnemonic] Ethers imported');
      const newMnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16));
      console.log('[generateMnemonic] Mnemonic generated:', newMnemonic);
      setMnemonic(newMnemonic);
      addLog('operation', '✅ Generated new mnemonic');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[generateMnemonic] Error:', error);
      addLog('error', `❌ Error generating mnemonic: ${errorMsg}`);
    }
  }

  // Crear wallet desde mnemonic
  async function createWallet(): Promise<void> {
    if (!mnemonic.trim()) {
      addLog('error', 'Mnemonic is required');
      return;
    }

    try {
      addLog('operation', 'Starting wallet creation...');
      
      // Validar mnemonic
      const { ethers } = await import('ethers');
      ethers.Mnemonic.fromPhrase(mnemonic.trim());
      addLog('operation', 'Mnemonic validated');

      // Guardar mnemonic
      await sendRPC('wallet_setMnemonic', [mnemonic.trim()]);
      addLog('operation', 'Mnemonic saved');

      // Derivar 5 cuentas
      addLog('operation', 'Deriving accounts...');
      const accounts = (await sendRPC('wallet_deriveAccounts', [
        mnemonic.trim(),
        5,
      ])) as string[];
      addLog('operation', `Derived ${accounts.length} accounts: ${accounts.join(', ')}`);

      // Guardar las cuentas en el background
      await sendRPC('wallet_setAccounts', [accounts]);
      addLog('operation', 'Accounts saved to background');

      // Esperar un momento para que se guarde
      await new Promise(resolve => setTimeout(resolve, 100));

      // Actualizar estado local inmediatamente
      const newState: WalletState = {
        mnemonic: mnemonic.trim(),
        accounts,
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
      
      setWalletState(newState);
      addLog('operation', `Wallet created with ${accounts.length} accounts`);
      
      // Verificar que se guardó correctamente
      try {
        const savedState = (await sendRPC('wallet_getState', [])) as WalletState;
        if (savedState.accounts.length === accounts.length) {
          addLog('operation', 'Wallet state verified and saved correctly');
        } else {
          addLog('error', 'Wallet state mismatch after save');
        }
      } catch (error) {
        addLog('error', `Error verifying saved state: ${error}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog('error', `Error creating wallet: ${errorMsg}`);
      console.error('Wallet creation error:', error);
    }
  }

  // Actualizar balance
  async function updateBalance(): Promise<void> {
    if (!walletState?.accounts[walletState.currentAccount]) return;

    try {
      const address = walletState.accounts[walletState.currentAccount];
      const balanceHex = (await sendRPC('eth_getBalance', [
        address,
        'latest',
      ])) as string;
      const { ethers } = await import('ethers');
      const balanceBigInt = BigInt(balanceHex);
      const balanceEth = ethers.formatEther(balanceBigInt);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      // Solo loguear el error la primera vez o si es diferente
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        // No loguear errores de red repetitivos, solo mostrar "N/A" en el balance
        setBalance('N/A');
      } else {
        addLog('error', `Error updating balance: ${errorMsg}`);
      }
    }
  }

  // Cambiar cuenta actual
  async function setCurrentAccount(index: number): Promise<void> {
    try {
      await sendRPC('wallet_setCurrentAccount', [index]);
      await loadWalletState();
      addLog('operation', `Switched to account ${index}`);
    } catch (error) {
      addLog('error', `Error switching account: ${error}`);
    }
  }

  // Reset wallet
  async function resetWallet(): Promise<void> {
    if (!confirm('Are you sure you want to reset the wallet? This will clear all data.')) {
      return;
    }

    try {
      await sendRPC('wallet_reset', []);
      setWalletState(null);
      setMnemonic('');
      setBalance('0');
      addLog('operation', 'Wallet reset');
    } catch (error) {
      addLog('error', `Error resetting wallet: ${error}`);
    }
  }

  // Transferir entre cuentas
  async function transferInternal(
    toIndex: number,
    amount: string
  ): Promise<void> {
    if (!walletState) return;

    try {
      const { ethers } = await import('ethers');
      const toAddress = walletState.accounts[toIndex];
      const value = ethers.parseEther(amount).toString();

      await sendRPC('eth_sendTransaction', [
        {
          to: toAddress,
          value: '0x' + BigInt(value).toString(16),
        },
      ]);

      addLog('operation', `Transfer ${amount} ETH to account ${toIndex}`);
    } catch (error) {
      addLog('error', `Error transferring: ${error}`);
    }
  }

  const currentAddress =
    walletState?.accounts[walletState.currentAccount] || null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>CodeCrypto Wallet</h1>
      </header>

      <main className="app-main">
        {(!walletState?.mnemonic && (!walletState?.accounts || walletState.accounts.length === 0)) ? (
          <div className="setup-section">
            <h2>Create or Import Wallet</h2>
            <div className="mnemonic-input">
              <textarea
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter 12-word mnemonic phrase or generate new one"
                rows={3}
              />
              <div className="button-group">
                <button 
                  onClick={() => {
                    console.log('[UI] Generate New button clicked');
                    generateMnemonic();
                  }}
                >
                  Generate New
                </button>
                <button 
                  onClick={() => {
                    console.log('[UI] Create Wallet button clicked, mnemonic:', mnemonic ? 'present' : 'empty');
                    createWallet();
                  }} 
                  disabled={!mnemonic.trim()}
                >
                  Create Wallet
                </button>
                <button 
                  onClick={loadWalletState} 
                  className="secondary"
                  title="Recargar wallet guardada"
                >
                  🔄 Reload
                </button>
                <button 
                  onClick={restoreAccountsFromMnemonic} 
                  className="secondary"
                  title="Restaurar cuentas desde mnemonic guardado"
                >
                  🔧 Restore
                </button>
              </div>
              {mnemonic && (
                <div className="hint">
                  <p>Hint: Click words to copy</p>
                  <div className="mnemonic-words">
                    {mnemonic.split(' ').map((word, i) => (
                      <span
                        key={i}
                        className="mnemonic-word"
                        onClick={() => {
                          navigator.clipboard.writeText(word);
                          addLog('operation', `Copied word: ${word}`);
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="wallet-section">
              <h2>Wallet</h2>
              <div className="account-info">
                <div className="balance">
                  <span className="label">Balance:</span>
                  <span className="value">{balance} ETH</span>
                </div>
                <div className="address">
                  <span className="label">Address:</span>
                  <span className="value">{currentAddress}</span>
                </div>
                <div className="chain">
                  <span className="label">Chain ID:</span>
                  <span className="value">{walletState?.currentChainId || '0x7a69'}</span>
                </div>
              </div>

              <div className="accounts-list">
                <h3>Accounts</h3>
                {walletState?.accounts.map((addr, i) => (
                  <div
                    key={i}
                    className={`account-item ${
                      i === walletState?.currentAccount ? 'active' : ''
                    }`}
                    onClick={() => setCurrentAccount(i)}
                  >
                    <span className="account-index">{i}</span>
                    <span className="account-address">{addr}</span>
                  </div>
                ))}
              </div>

              <div className="actions">
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="secondary"
                >
                  {showMnemonic ? 'Hide' : 'Show'} Mnemonic
                </button>
                <button onClick={resetWallet} className="danger">
                  Reset Wallet
                </button>
              </div>

              {showMnemonic && (
                <div className="mnemonic-display">
                  <p>Mnemonic Phrase:</p>
                  <div className="mnemonic-words">
                    {walletState?.mnemonic?.split(' ').map((word, i) => (
                      <span key={i} className="mnemonic-word">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="logs-section">
              <h2>Logs</h2>
              <div className="logs-container">
                {logs.map((log, i) => (
                  <div key={i} className={`log-entry log-${log.type}`}>
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="log-message">{log.message}</span>
                    {log.data && (
                      <pre className="log-data">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

