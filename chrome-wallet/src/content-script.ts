// Content script que inyecta el provider en la página
(function () {
  console.log('[Content Script] Iniciando content script...');
  
  // Establecer una propiedad en window para indicar que el content script está activo
  // Esto se hace directamente desde el content script, no desde un script inyectado
  // para evitar problemas con CSP
  try {
    // Usar Object.defineProperty para establecer la propiedad de forma segura
    Object.defineProperty(window, '__codecrypto_content_script_active', {
      value: true,
      writable: false,
      configurable: true
    });
    console.log('[Content Script] ✅ Content script está ejecutándose (marcador establecido)');
  } catch (e) {
    console.error('[Content Script] Error estableciendo marcador:', e);
  }
  
  function injectScript() {
    // Verificar que el DOM esté disponible
    if (!document.head && !document.documentElement) {
      console.log('[Content Script] DOM no disponible, reintentando...');
      setTimeout(injectScript, 10);
      return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
      console.log('[Content Script] inject.js cargado correctamente');
      // El script se elimina después de cargar
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
    script.onerror = function () {
      console.error('[Content Script] Error cargando inject.js');
    };
    
    // Intentar inyectar en head primero, luego en documentElement
    if (document.head) {
      document.head.appendChild(script);
    } else if (document.documentElement) {
      document.documentElement.appendChild(script);
    } else {
      console.error('[Content Script] No se pudo encontrar dónde inyectar el script');
    }
  }

  // IMPORTANTE: Configurar el listener ANTES de inyectar el script
  // para asegurar que esté listo cuando el inject script envíe mensajes
  
  // Función para enviar mensaje al contexto de la página
  // Usar SOLO window.postMessage para evitar duplicados
  function sendToPage(data: unknown) {
    window.postMessage(data, '*');
  }
  
  // Escuchar mensajes de la página (desde inject.js)
  // Usar tanto addEventListener como eventos del DOM
  const handleMessage = (data: any) => {
    if (!data || !data.type) return;
    
    console.log('[Content Script] Mensaje recibido:', data.type, data);
    
    // Manejar ping
    if (data.type === 'CODECRYPTO_PING') {
      sendToPage({ type: 'CODECRYPTO_PONG', id: data.id });
      console.log('[Content Script] Pong enviado');
      return;
    }
    
    // Manejar RPC
    if (data.type === 'CODECRYPTO_RPC') {
      handleRPC(data);
    }
  };
  
  const handleRPC = (data: any) => {
    console.log('[Content Script] Recibido mensaje RPC:', data.payload?.method, data.id);

    try {
      // Verificar que chrome.runtime esté disponible
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        console.error('[Content Script] chrome.runtime no disponible');
        sendToPage({
          type: 'CODECRYPTO_RPC_RESPONSE',
          id: data.id,
          response: {
            error: {
              code: -32000,
              message: 'chrome.runtime not available',
            },
            jsonrpc: '2.0',
          },
        });
        return;
      }

      console.log('[Content Script] Enviando mensaje al background:', data.payload);
      chrome.runtime.sendMessage(data.payload, (response) => {
        try {
          console.log('[Content Script] Respuesta del background recibida:', response);
          console.log('[Content Script] chrome.runtime.lastError:', chrome.runtime.lastError);
          
          // Manejar errores de Chrome
          if (chrome.runtime.lastError) {
            console.error('[Content Script] Error de chrome.runtime:', chrome.runtime.lastError.message);
            sendToPage({
              type: 'CODECRYPTO_RPC_RESPONSE',
              id: data.id,
              response: {
                error: {
                  code: -32000,
                  message: chrome.runtime.lastError.message || 'Unknown error',
                },
                jsonrpc: '2.0',
              },
            });
            console.log('[Content Script] Error enviado de vuelta a la página');
            return;
          }

          // Enviar respuesta de vuelta a la página
          const responseToSend = response || {
            error: {
              code: -32000,
              message: 'No response from background',
            },
            jsonrpc: '2.0',
          };

          console.log('[Content Script] Enviando respuesta a la página:', responseToSend);
          const responseMessage = {
            type: 'CODECRYPTO_RPC_RESPONSE',
            id: data.id,
            response: responseToSend,
          };
          sendToPage(responseMessage);
          console.log('[Content Script] Respuesta enviada con ID:', data.id);
        } catch (error) {
          console.error('[Content Script] Error procesando respuesta del background:', error);
          sendToPage({
            type: 'CODECRYPTO_RPC_RESPONSE',
            id: data.id,
            response: {
              error: {
                code: -32000,
                message: error instanceof Error ? error.message : 'Unknown error processing response',
              },
              jsonrpc: '2.0',
            },
          });
        }
      });
    } catch (error) {
      console.error('[Content Script] Error en handleRPC:', error);
      sendToPage({
        type: 'CODECRYPTO_RPC_RESPONSE',
        id: data.id,
        response: {
          error: {
            code: -32000,
            message: error instanceof Error ? error.message : 'Unknown error in handleRPC',
          },
          jsonrpc: '2.0',
        },
      });
    }
  };
  
  // Escuchar window.postMessage (método principal)
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type) {
      handleMessage(event.data);
    }
  });

  // Escuchar mensajes del background y reenviarlos a la página
  chrome.runtime.onMessage.addListener((message) => {
    // Reenviar eventos a la página
    window.postMessage(message, '*');
  });

  // Inyectar el script DESPUÉS de configurar los listeners
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectScript);
  } else {
    injectScript();
  }
})();

