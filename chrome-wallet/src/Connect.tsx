import { useState, useEffect } from 'react';
import './App.css';

interface WalletState {
  accounts: string[];
  currentAccount: number;
}

function Connect() {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  useEffect(() => {
    loadWalletState();
  }, []);

  async function sendRPC(method: string, params: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          id: Date.now(),
          method,
          params,
          jsonrpc: '2.0',
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response.error) {
            reject(new Error(response.error.message));
            return;
          }
          resolve(response.result);
        }
      );
    });
  }

  async function loadWalletState(): Promise<void> {
    try {
      const state = (await sendRPC('wallet_getState', [])) as WalletState;
      setWalletState(state);
      setSelectedAccount(state.currentAccount);
    } catch (error) {
      console.error('Error loading wallet state:', error);
    }
  }

  async function connect(): Promise<void> {
    if (selectedAccount === null || !walletState) return;

    try {
      await sendRPC('wallet_setCurrentAccount', [selectedAccount]);
      // Enviar mensaje a la página que inició la conexión
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'connect_response',
          account: walletState.accounts[selectedAccount],
        });
      }
      window.close();
    } catch (error) {
      console.error('Error connecting:', error);
    }
  }

  if (!walletState) {
    return (
      <div className="app">
        <div className="connect-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="connect-container">
        <header className="connect-header">
          <div className="header-content">
            <span className="header-icon">🔒</span>
            <div>
              <h1>CodeCrypto Wallet</h1>
              <p className="header-subtitle">Solicitud de Conexión</p>
            </div>
          </div>
        </header>

        <div className="connect-content">
          <div className="request-section">
            <div className="section-header">
              <span className="section-icon">🌐</span>
              <h3>Conectar a dApp</h3>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">ORIGEN:</span>
              <span className="detail-value" id="origin-url">Cargando...</span>
            </div>
          </div>

          <div className="instruction-box">
            <p>Selecciona la cuenta que deseas conectar a esta aplicación:</p>
          </div>

          <div className="accounts-list">
            {walletState.accounts.map((addr, i) => (
              <div
                key={i}
                className={`account-item ${
                  i === selectedAccount ? 'active' : ''
                }`}
                onClick={() => setSelectedAccount(i)}
              >
                <input
                  type="radio"
                  name="account"
                  checked={i === selectedAccount}
                  onChange={() => setSelectedAccount(i)}
                />
                <div className="account-info">
                  <div className="account-label">CUENTA {i}</div>
                  <div className="account-address-short">
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </div>
                  <div className="account-address-full">{addr}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="connect-actions">
            <button onClick={() => window.close()} className="button-reject">
              <span className="button-icon">✕</span>
              Cancelar
            </button>
            <button
              onClick={connect}
              disabled={selectedAccount === null}
              className="button-approve"
            >
              <span className="button-icon">✓</span>
              Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;

