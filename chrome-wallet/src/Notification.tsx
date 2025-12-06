import { useState, useEffect } from 'react';
import './App.css';
import { WalletState } from './types';

interface PendingRequest {
  id: number;
  method: string;
  params: unknown[];
  timestamp: number;
}

function Notification() {
  const [request, setRequest] = useState<PendingRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletState, setWalletState] = useState<WalletState | null>(null);

  useEffect(() => {
    // Obtener ID de request desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');

    if (requestId) {
      loadRequest(parseInt(requestId, 10));
    }
  }, []);

  async function sendRPC(method: string, params: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar que chrome.runtime esté disponible
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
          reject(new Error('chrome.runtime not available'));
          return;
        }

        console.log('[Notification] Enviando RPC:', method, params);
        
        // Agregar timeout para evitar que se quede colgado
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout - El background script no respondió'));
        }, 10000);

        chrome.runtime.sendMessage(
          {
            id: Date.now(),
            method,
            params,
            jsonrpc: '2.0',
          },
          (response) => {
            clearTimeout(timeout);
            
            // Verificar errores de Chrome primero
            if (chrome.runtime.lastError) {
              console.error('[Notification] Error de chrome.runtime:', chrome.runtime.lastError.message);
              // Si el error es "Extension context invalidated", el Service Worker se desconectó
              if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
                reject(new Error('El Service Worker se desconectó. Por favor, recarga la extensión.'));
              } else {
                reject(new Error(chrome.runtime.lastError.message));
              }
              return;
            }

            // Verificar si hay respuesta
            if (!response) {
              console.error('[Notification] No response received');
              reject(new Error('No response from background'));
              return;
            }

            console.log('[Notification] Respuesta recibida:', response);

            // Verificar errores en la respuesta
            if (response.error) {
              console.error('[Notification] Error en respuesta:', response.error);
              reject(new Error(response.error.message || 'Unknown error'));
              return;
            }

            resolve(response.result);
          }
        );
      } catch (error) {
        console.error('[Notification] Error en sendRPC:', error);
        reject(error instanceof Error ? error : new Error('Unknown error in sendRPC'));
      }
    });
  }

  async function loadRequest(requestId: number): Promise<void> {
    try {
      console.log('[Notification] Cargando solicitud, requestId:', requestId);
      const pending = (await sendRPC('get_pending_requests', [])) as PendingRequest[];
      console.log('[Notification] Solicitudes pendientes:', pending);
      const req = pending.find((r) => r.id === requestId);
      if (req) {
        console.log('[Notification] Solicitud encontrada:', req);
        setRequest(req);
      } else {
        console.error('[Notification] Solicitud no encontrada para requestId:', requestId);
      }
      
      // Cargar estado de wallet para obtener chainId
      const state = (await sendRPC('wallet_getState', [])) as WalletState;
      setWalletState(state);
    } catch (error) {
      console.error('[Notification] Error loading request:', error);
    }
  }

  async function approve(): Promise<void> {
    if (!request) return;

    console.log('[Notification] Aprobando solicitud, requestId:', request.id);
    setLoading(true);
    try {
      await sendRPC('notification_response', [request.id, true]);
      console.log('[Notification] Solicitud aprobada exitosamente');
      window.close();
    } catch (error) {
      console.error('[Notification] Error approving:', error);
      setLoading(false);
    }
  }

  async function reject(): Promise<void> {
    if (!request) return;

    console.log('[Notification] Rechazando solicitud, requestId:', request.id);
    setLoading(true);
    try {
      await sendRPC('notification_response', [request.id, false]);
      console.log('[Notification] Solicitud rechazada exitosamente');
      window.close();
    } catch (error) {
      console.error('[Notification] Error rejecting:', error);
      setLoading(false);
    }
  }

  if (!request) {
    return (
      <div className="app">
        <div className="notification-container">
          <p>Loading request...</p>
        </div>
      </div>
    );
  }

  const isTransaction = request.method === 'eth_sendTransaction';
  const isSignTypedData = request.method === 'eth_signTypedData_v4';
  
  // Obtener información de la red actual
  const getNetworkName = (chainId: string): string => {
    const chainIdNum = parseInt(chainId, 16);
    if (chainIdNum === 31337) return 'Hardhat Local (31337)';
    if (chainIdNum === 11155111) return 'Sepolia (11155111)';
    if (chainIdNum === 1) return 'Ethereum Mainnet (1)';
    return `Chain ${chainIdNum}`;
  };

  const tx = isTransaction ? (request.params[0] as any) : null;
  // typedData puede venir como objeto o como string JSON
  const typedDataParam = isSignTypedData ? request.params[1] : null;
  const typedData = isSignTypedData 
    ? (typeof typedDataParam === 'string' 
        ? JSON.parse(typedDataParam || '{}') 
        : typedDataParam || {})
    : null;
  const chainId = typedData?.domain?.chainId 
    ? `0x${Number(typedData.domain.chainId).toString(16)}` 
    : walletState?.currentChainId || '0x7a69';

  return (
    <div className="app">
      <div className="notification-container">
        <header className="notification-header">
          <div className="header-content">
            <span className="header-icon">🔒</span>
            <div>
              <h1>CodeCrypto Wallet</h1>
              <p className="header-subtitle">
                {isTransaction ? 'Confirmar Transacción' : isSignTypedData ? 'Solicitud de Firma' : 'Solicitud'}
              </p>
            </div>
          </div>
        </header>

        <div className="notification-content">
          {isTransaction && (
            <div className="request-section">
              <div className="section-header">
                <span className="section-icon">🌐</span>
                <h3>Confirmar Transacción</h3>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">PARA:</span>
                <span className="detail-value">
                  {tx?.to || 'Contract Creation'}
                </span>
              </div>
              
              {tx?.value && (
                <div className="detail-item">
                  <span className="detail-label">VALOR:</span>
                  <span className="detail-value">
                    {formatEther(tx.value)} ETH
                  </span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-label">RED:</span>
                <span className="detail-value">
                  {getNetworkName(chainId)}
                </span>
              </div>
            </div>
          )}

          {isSignTypedData && typedData && (
            <div className="request-section">
              <div className="section-header">
                <span className="section-icon">⚡</span>
                <h3>Firmar Mensaje EIP-712</h3>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">DIRECCIÓN:</span>
                <span className="detail-value">
                  {request.params[0] as string}
                </span>
              </div>
              
              {typedData.message && (
                <div className="detail-item">
                  <span className="detail-label">MENSAJE:</span>
                  <span className="detail-value">
                    {typeof typedData.message === 'object' 
                      ? JSON.stringify(typedData.message, null, 2)
                      : String(typedData.message)}
                  </span>
                </div>
              )}
              
              {typedData.domain && (
                <div className="detail-item">
                  <span className="detail-label">DOMINIO:</span>
                  <span className="detail-value">
                    {typedData.domain.name || 'N/A'}
                    {typedData.domain.version && ` v${typedData.domain.version}`}
                    {typedData.domain.chainId && ` (Chain: ${typedData.domain.chainId})`}
                  </span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-label">RED:</span>
                <span className="detail-value">
                  {getNetworkName(chainId)}
                </span>
              </div>
            </div>
          )}

          <div className="notification-actions">
            <button
              onClick={reject}
              disabled={loading}
              className="button-reject"
            >
              <span className="button-icon">✕</span>
              Rechazar
            </button>
            <button
              onClick={approve}
              disabled={loading}
              className="button-approve"
            >
              <span className="button-icon">✓</span>
              {loading ? 'Procesando...' : 'Aprobar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatEther(valueHex: string): string {
  try {
    const value = BigInt(valueHex);
    const eth = Number(value) / 1e18;
    return eth.toFixed(6);
  } catch {
    return '0';
  }
}

export default Notification;

