// Inject script - Provider EIP-1193 (window.codecrypto)
(function () {
  if (typeof window === 'undefined') return;

  // Evitar inyección múltiple
  if ((window as any).codecrypto) {
    return;
  }

  let requestIdCounter = 0;
  const pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    method: string;
  }>();

  // Variable para rastrear si el content script está activo (basado en ping/pong)
  let contentScriptActive = false;

  // Declarar provider aquí para que esté disponible en el listener global
  let provider: any = null;

  // Listener global único para todas las respuestas RPC
  const globalRPCResponseHandler = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || !data.type) return;

    // Manejar PONG
    if (data.type === 'CODECRYPTO_PONG') {
      contentScriptActive = true;
      return;
    }

    // Manejar respuestas RPC
    if (data.type === 'CODECRYPTO_RPC_RESPONSE') {
      const responseId = data.id;
      const request = pendingRequests.get(responseId);
      
      if (request) {
        // Encontramos la solicitud correspondiente
        pendingRequests.delete(responseId);
        
        const response = data.response;
        if (response && response.error) {
          request.reject(new Error(response.error.message || 'Unknown error'));
        } else if (response) {
          // Si la respuesta indica que hay una solicitud pendiente, hacer polling
          if (response.result && typeof response.result === 'object' && 'pending' in response.result && 'requestId' in response.result) {
            const timeout = request.method === 'eth_sendTransaction' || request.method === 'eth_signTypedData_v4' ? 30000 : 10000;
            pollForResult(response.result.requestId as number, request.resolve, request.reject, timeout);
          } else {
            request.resolve(response.result);
          }
        } else {
          request.reject(new Error('No response received'));
        }
      }
      // Si no encontramos la solicitud, simplemente ignoramos la respuesta
      // (puede ser una respuesta tardía de una solicitud que ya expiró)
      return;
    }

    // Manejar eventos de provider (accountsChanged, chainChanged)
    const { type, accounts, chainId } = data;
    if (type === 'accountsChanged' && provider) {
      provider.emit('accountsChanged', accounts);
    } else if (type === 'chainChanged' && provider) {
      provider.emit('chainChanged', chainId);
    }
  };
  
  window.addEventListener('message', globalRPCResponseHandler);


  // Función para hacer polling del resultado de una solicitud pendiente
  async function pollForResult(
    requestId: number,
    resolve: (value: unknown) => void,
    reject: (error: Error) => void,
    timeoutMs: number = 30000
  ): Promise<void> {
    const maxAttempts = Math.floor(timeoutMs / 500); // Intentos basados en el timeout
    let attempts = 0;
    let pollTimeout: NodeJS.Timeout | null = null;
    let globalTimeout: NodeJS.Timeout | null = null;
    let isCancelled = false;
    
    const cleanup = () => {
      if (pollTimeout) {
        clearTimeout(pollTimeout);
        pollTimeout = null;
      }
      if (globalTimeout) {
        clearTimeout(globalTimeout);
        globalTimeout = null;
      }
    };
    
    const poll = async () => {
      if (isCancelled) return;
      
      attempts++;
      try {
        const result = await sendRPC('get_request_result', [requestId]);
        if (!isCancelled) {
          cleanup();
          resolve(result);
        }
      } catch (error: any) {
        if (isCancelled) return;
        
        const errorMessage = error?.message || String(error);
        console.log(`[CodeCrypto] Polling intento ${attempts}/${maxAttempts} - Error:`, errorMessage);
        
        // Si el error es "Result not found", continuar polling
        if (errorMessage.includes('Result not found') || errorMessage.includes('not found')) {
          if (attempts >= maxAttempts) {
            console.log('[CodeCrypto] Polling agotado después de', attempts, 'intentos');
            cleanup();
            reject(new Error('Request timeout - El usuario no respondió a tiempo'));
            return;
          }
          // Esperar 500ms antes del siguiente intento
          pollTimeout = setTimeout(poll, 500);
        } else {
          // Otro tipo de error, rechazar inmediatamente
          console.error('[CodeCrypto] Error inesperado durante polling:', error);
          cleanup();
          reject(error);
        }
      }
    };
    
    // Timeout global para cancelar el polling
    globalTimeout = setTimeout(() => {
      isCancelled = true;
      cleanup();
      reject(new Error('Request timeout - El usuario no respondió a tiempo'));
    }, timeoutMs);
    
    // Esperar un poco antes del primer intento para dar tiempo a que se abra el popup
    pollTimeout = setTimeout(() => {
      if (!isCancelled) {
        poll().catch((err) => {
          if (!isCancelled) {
            cleanup();
            reject(err);
          }
        });
      }
    }, 1000);
  }

  // Función para enviar RPC al background (vía content script)
  async function sendRPC(method: string, params: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++requestIdCounter;
      pendingRequests.set(id, { resolve, reject, method });

      console.log('[CodeCrypto] Enviando mensaje RPC al content script:', method, id);
      
      // Verificar que el content script esté escuchando
      // Enviar un mensaje de prueba primero
      const testMessage = {
        type: 'CODECRYPTO_PING',
        id: -1,
      };
      window.postMessage(testMessage, '*');
      console.log('[CodeCrypto] Ping enviado al content script');
      
      // Enviar mensaje al content script usando window.postMessage
      const rpcMessage = {
        type: 'CODECRYPTO_RPC',
        id: id,
        payload: {
          id,
          method,
          params,
          jsonrpc: '2.0',
        },
      };
      window.postMessage(rpcMessage, '*');
      console.log('[CodeCrypto] Mensaje RPC enviado:', rpcMessage);

      // El listener global (globalRPCResponseHandler) manejará la respuesta
      // Solo necesitamos configurar el timeout aquí

      // Timeout de seguridad (30 segundos para transacciones, 10 para otras)
      const timeout = method === 'eth_sendTransaction' || method === 'eth_signTypedData_v4' ? 30000 : 10000;
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error('Request timeout - El background script no respondió. Verifica que la extensión esté activa.'));
        }
      }, timeout);
    });
  }

  // Provider EIP-1193
  class CodeCryptoProvider {
    private _isCodeCrypto = true;
    private _selectedAddress: string | null = null;
    private _chainId: string = '0x7a69';
    private _listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

    // Métodos EIP-1193
    async request(args: { method: string; params?: unknown[] }): Promise<unknown> {
      const { method, params = [] } = args;

      // Log de llamadas
      console.log('[CodeCrypto] RPC Call:', method, params);

      try {
        switch (method) {
          case 'eth_requestAccounts': {
            const accounts = await sendRPC('eth_requestAccounts', []) as string[];
            if (accounts.length > 0) {
              this._selectedAddress = accounts[0];
              this.emit('connect', { chainId: this._chainId });
            }
            return accounts;
          }

          case 'eth_accounts': {
            return await sendRPC('wallet_getAccounts', []);
          }

          case 'eth_chainId': {
            return await sendRPC('eth_chainId', []);
          }

          case 'eth_sendTransaction': {
            // sendRPC ya maneja el polling automáticamente cuando detecta { requestId, pending: true }
            // Solo necesitamos esperar a que se resuelva la promesa
            return await sendRPC('eth_sendTransaction', params);
          }

          case 'eth_signTypedData_v4': {
            // sendRPC ya maneja el polling automáticamente cuando detecta { requestId, pending: true }
            // Solo necesitamos esperar a que se resuelva la promesa
            const [address, typedData] = params as [string, string];
            return await sendRPC('eth_signTypedData_v4', [address, typedData]);
          }

          case 'eth_getBalance': {
            return await sendRPC('eth_getBalance', params);
          }

          case 'wallet_switchEthereumChain': {
            const [{ chainId }] = params as [{ chainId: string }];
            await sendRPC('wallet_switchEthereumChain', [{ chainId }]);
            this._chainId = chainId;
            this.emit('chainChanged', chainId);
            return null;
          }

          default:
            throw new Error(`Method not supported: ${method}`);
        }
      } catch (error) {
        console.error('[CodeCrypto] RPC Error:', error);
        throw error;
      }
    }

    // Eventos
    on(event: string, handler: (...args: unknown[]) => void): void {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }
      this._listeners.get(event)!.add(handler);
    }

    removeListener(event: string, handler: (...args: unknown[]) => void): void {
      this._listeners.get(event)?.delete(handler);
    }

    emit(event: string, ...args: unknown[]): void {
      this._listeners.get(event)?.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error('[CodeCrypto] Event handler error:', error);
        }
      });
    }

    get isCodeCrypto(): boolean {
      return this._isCodeCrypto;
    }

    get selectedAddress(): string | null {
      return this._selectedAddress;
    }

    get chainId(): string {
      return this._chainId;
    }
  }

  provider = new CodeCryptoProvider();

  // Inicializar chainId
  sendRPC('eth_chainId', [])
    .then((chainId) => {
      (provider as any)._chainId = chainId as string;
    })
    .catch(() => {
      // Ignorar errores en inicialización
    });

  // EIP-6963: Anunciar proveedor
  const announceProvider = () => {
    const detail = {
      info: {
        uuid: 'codecrypto-wallet',
        name: 'CodeCrypto Wallet',
        icon: '',
        rdns: 'io.codecrypto.wallet',
      },
      provider,
    };

    window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
  };

  // Escuchar solicitudes de proveedores
  window.addEventListener('eip6963:requestProvider', announceProvider);

  // Anunciar inmediatamente
  announceProvider();

  // Exponer provider
  (window as any).codecrypto = provider;
  (window as any).ethereum = provider; // Compatibilidad adicional

  console.log('[CodeCrypto] Provider injected');
})();

