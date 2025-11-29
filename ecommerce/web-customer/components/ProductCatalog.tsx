"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getEcommerceContract, formatEurt } from "@/lib/contracts";

interface ProductCatalogProps {
  walletAddress: string;
  onProductAdded?: () => void;
}

interface Product {
  productId: bigint;
  companyId: bigint;
  name: string;
  description: string;
  price: bigint;
  stock: bigint;
  imageHash: string;
  isActive: boolean;
  createdAt: bigint;
}

interface Company {
  companyId: bigint;
  name: string;
  companyAddress: string;
  taxId: string;
  owner: string;
  isActive: boolean;
  createdAt: bigint;
}

export default function ProductCatalog({ walletAddress, onProductAdded }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<Map<bigint, Company>>(new Map());
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<bigint | null>(null);

  useEffect(() => {
    if (walletAddress) {
      loadProducts();
    }
  }, [walletAddress]);

  const loadProducts = async () => {
    if (!window.ethereum) return;

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getEcommerceContract(provider);

      // Por ahora, cargamos productos de empresas conocidas
      // En producción, necesitarías una función para listar todas las empresas activas
      const companiesMap = new Map<bigint, Company>();
      const allProducts: Product[] = [];

      // Intentar cargar productos de las primeras empresas (1-5)
      for (let i = 1; i <= 5; i++) {
        try {
          const company = await contract.getCompany(BigInt(i));
          if (company.isActive) {
            companiesMap.set(company.companyId, company);
            const productIds = await contract.getCompanyProducts(company.companyId);
            
            for (const productId of productIds) {
              const product = await contract.getProduct(productId);
              if (product.isActive && product.stock > BigInt(0)) {
                allProducts.push(product);
              }
            }
          }
        } catch (err) {
          // Empresa no existe, continuar
          continue;
        }
      }

      setCompanies(companiesMap);
      setProducts(allProducts);
    } catch (err: any) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: bigint) => {
    if (!window.ethereum || !walletAddress) {
      alert("Conecta tu billetera primero");
      return;
    }

    setAddingToCart(productId);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);

      // Verificar que el producto existe y tiene stock antes de agregar
      let product;
      try {
        product = await contract.getProduct(productId);
      } catch (err: any) {
        throw new Error("El producto no existe o no se pudo obtener su información");
      }
      
      if (!product) {
        throw new Error("El producto no existe");
      }
      
      if (!product.isActive) {
        throw new Error("Este producto no está disponible (está desactivado)");
      }
      
      if (product.stock === BigInt(0)) {
        throw new Error("Este producto está agotado (sin stock)");
      }
      
      if (product.stock < BigInt(1)) {
        throw new Error("No hay suficiente stock disponible");
      }
      
      console.log("Producto verificado:", {
        productId: productId.toString(),
        name: product.name,
        stock: product.stock.toString(),
        isActive: product.isActive
      });

      // Verificar conexión RPC antes de enviar la transacción
      console.log("🔍 Verificando conexión con la blockchain...");
      try {
        const blockNumber = await provider.getBlockNumber();
        console.log("✅ Conexión RPC exitosa. Block actual:", blockNumber);
      } catch (rpcError: any) {
        console.error("❌ Error RPC al verificar conexión:", rpcError);
        if (rpcError.code === -32603 || rpcError.message?.includes("Internal JSON-RPC error")) {
          throw new Error("Error de conexión con la blockchain. Verifica que MetaMask esté conectado a 'Anvil Local' (Chain ID: 31337) y que Anvil esté corriendo en el puerto 8545. Puede que necesites reiniciar MetaMask o reconectarlo a la red local.");
        }
        throw new Error("No se puede conectar con la blockchain. Verifica que MetaMask esté conectado y que la red local esté disponible.");
      }
      
      // Agregar al carrito
      console.log("🚀 Enviando transacción para agregar producto al carrito...");
      console.log("📦 Producto ID:", productId.toString());
      console.log("👤 Wallet:", walletAddress);
      
      let tx, receipt;
      
      try {
        // Enviar transacción y esperar confirmación
        tx = await contract.addToCart(productId, 1n);
        console.log("✅ Transacción enviada, hash:", tx.hash);
        console.log("⏳ Esperando confirmación (esto puede tomar unos segundos)...");
        
        // Esperar a que la transacción sea minada con un timeout
        receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout esperando confirmación")), 60000)
          )
        ]) as any;
        
        console.log("📋 Recibo recibido:", {
          status: receipt.status,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          logsCount: receipt.logs?.length || 0
        });
      } catch (txError: any) {
        console.error("❌ Error en la transacción:", txError);
        
        // Manejar errores RPC específicos
        if (txError.code === -32603 || txError.message?.includes("Internal JSON-RPC error")) {
          throw new Error("Error de conexión RPC con MetaMask. Verifica que MetaMask esté conectado a 'Anvil Local' y que Anvil esté corriendo. Intenta reiniciar MetaMask o reconectarlo a la red local.");
        }
        
        // Si la transacción falla antes de ser minada
        if (txError.reason || txError.message) {
          throw txError;
        }
        throw new Error("Error al enviar la transacción: " + (txError.message || "Error desconocido"));
      }
      
      // Verificar que la transacción fue exitosa
      if (!receipt) {
        throw new Error("No se recibió recibo de la transacción");
      }
      
      if (receipt.status !== 1) {
        // La transacción fue revertida
        console.error("❌ Transacción revertida. Status:", receipt.status);
        throw new Error("La transacción fue revertida por el contrato. El producto podría no estar disponible o no tener stock suficiente.");
      }
      
      console.log("✅ Transacción confirmada exitosamente", receipt.transactionHash);
      console.log("📊 Detalles del recibo:", {
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.transactionHash,
        logsCount: receipt.logs?.length || 0
      });
      
      // Verificar que el evento CartItemAdded fue emitido
      let eventFound = false;
      let eventDetails: any = null;
      
      if (receipt.logs && receipt.logs.length > 0) {
        console.log(`📋 Analizando ${receipt.logs.length} logs para encontrar eventos...`);
        try {
          // Intentar parsear los eventos
          for (const log of receipt.logs) {
            try {
              const parsed = contract.interface.parseLog(log);
              if (parsed && parsed.name === "CartItemAdded") {
                eventFound = true;
                eventDetails = parsed.args;
                console.log("✅ Evento CartItemAdded encontrado:", {
                  customer: parsed.args[0],
                  productId: parsed.args[1].toString(),
                  quantity: parsed.args[2].toString()
                });
                
                // Verificar que el evento corresponde al producto y usuario correctos
                const eventProductId = parsed.args[1].toString();
                const eventCustomer = parsed.args[0].toLowerCase();
                const currentAddress = (await signer.getAddress()).toLowerCase();
                
                if (eventProductId === productId.toString() && eventCustomer === currentAddress) {
                  console.log("✅ Evento confirmado: producto agregado correctamente para el usuario correcto");
                } else {
                  console.warn("⚠️ El evento corresponde a un producto o usuario diferente");
                }
                break;
              }
            } catch (e) {
              // Continuar buscando en otros logs
            }
          }
        } catch (e) {
          console.warn("Error al parsear eventos:", e);
        }
      } else {
        console.warn("⚠️ No hay logs en el recibo de la transacción");
      }
      
      // Si el evento se emitió, confiar en él - el producto está en el carrito
      // Los errores RPC al leer el estado no deben invalidar una transacción exitosa
      if (eventFound && eventDetails) {
        console.log("✅ Evento CartItemAdded confirmado. El producto se agregó correctamente al carrito.");
        console.log("💡 Intentando verificar el carrito (opcional, puede fallar por errores RPC)...");
        
        // Intentar verificar el carrito de forma opcional (no fallar si hay errores RPC)
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const readProvider = new ethers.BrowserProvider(window.ethereum);
          const readContract = getEcommerceContract(readProvider);
          const cartData = await readContract.getCart();
          
          console.log("✅ Verificación opcional exitosa - Carrito obtenido:", {
            customer: cartData.customer,
            itemsCount: cartData.items?.length || 0
          });
          
          const productInCart = cartData.items?.some((item: any) => 
            item.productId.toString() === productId.toString()
          ) || false;
          
          if (productInCart) {
            console.log("✅ Producto confirmado en el carrito!");
          } else {
            console.warn("⚠️ El producto no apareció en la verificación, pero el evento confirma que se agregó. Esto puede ser un problema de sincronización temporal.");
          }
        } catch (verifyError: any) {
          // No fallar si hay errores RPC - el evento ya confirma que la transacción fue exitosa
          console.warn("⚠️ No se pudo verificar el carrito (error RPC esperado):", verifyError.message || verifyError);
          console.log("✅ Sin embargo, el evento CartItemAdded confirma que el producto se agregó correctamente.");
        }
      } else {
        // Si no encontramos el evento, intentar verificar el carrito de forma más agresiva
        console.warn("⚠️ No se encontró el evento CartItemAdded en los logs.");
        console.log("🔍 Intentando verificar el carrito directamente...");
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const readProvider = new ethers.BrowserProvider(window.ethereum);
          const readContract = getEcommerceContract(readProvider);
          const cartData = await readContract.getCart();
          
          console.log("📦 Carrito obtenido:", {
            customer: cartData.customer,
            itemsCount: cartData.items?.length || 0,
            items: cartData.items
          });
          
          const productInCart = cartData.items?.some((item: any) => 
            item.productId.toString() === productId.toString()
          ) || false;
          
          if (productInCart) {
            console.log("✅ Producto verificado en el carrito!");
          } else {
            console.error("❌ El producto NO está en el carrito después de la transacción.");
            throw new Error("La transacción se confirmó pero el producto no se agregó al carrito. Verifica que Anvil esté corriendo correctamente.");
          }
        } catch (verifyError: any) {
          // Si hay errores RPC o CartNotFound sin evento, es más problemático
          if (verifyError.code === -32603 || verifyError.message?.includes("Internal JSON-RPC error")) {
            throw new Error("Error de conexión con la blockchain durante la verificación. El producto podría haberse agregado, pero no se pudo confirmar. Verifica tu conexión y el estado del carrito manualmente.");
          }
          
          // Si es CartNotFound sin evento, la transacción realmente falló
          if (verifyError.code === "CALL_EXCEPTION") {
            const errorData = verifyError.data || verifyError.message || "";
            const errorStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            
            if (errorStr.includes("CartNotFound") || errorStr.includes("0xa9965755") || errorStr.includes("a9965755")) {
              throw new Error("La transacción se confirmó pero el producto no se agregó al carrito. Esto podría indicar que la transacción no se ejecutó completamente. Por favor, intenta nuevamente.");
            }
          }
          
          throw verifyError;
        }
      }
      
      // Solo mostrar éxito si la transacción se confirmó correctamente Y el producto está en el carrito
      // Recargar productos para actualizar stock
      await loadProducts();
      
      // Notificar que se agregó un producto
      if (onProductAdded) {
        onProductAdded();
      }
      
      // Mostrar mensaje de éxito
      const successMessage = document.createElement("div");
      successMessage.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in";
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Producto agregado al carrito exitosamente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      
      // Detectar tipos específicos de errores
      let errorMessage = "Error al agregar producto al carrito";
      let detailedError = "";
      
      // Manejar errores RPC primero (críticos)
      if (err.code === -32603 || err.message?.includes("Internal JSON-RPC error")) {
        errorMessage = "Error de conexión con la blockchain";
        detailedError = "MetaMask no puede comunicarse con Anvil. Verifica que MetaMask esté conectado a 'Anvil Local' (Chain ID: 31337) y que Anvil esté corriendo en el puerto 8545. Intenta reiniciar MetaMask.";
      }
      // Analizar el error en detalle
      else if (err.reason) {
        errorMessage = err.reason;
        detailedError = `Razón: ${err.reason}`;
      } else if (err.message) {
        errorMessage = err.message;
        detailedError = err.message;
      } else if (err.code === "ACTION_REJECTED") {
        errorMessage = "Transacción rechazada. Por favor, intenta nuevamente.";
      } else if (err.code === "CALL_EXCEPTION" || err.code === "UNPREDICTABLE_GAS_LIMIT") {
        // Error del contrato - analizar el data
        let errorData = err.data;
        if (!errorData && err.transaction?.data) {
          errorData = err.transaction.data;
        }
        
        if (errorData) {
          // Intentar decodificar el error
          const dataStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
          
          // Verificar selectores de errores conocidos
          if (dataStr.includes("0xa9965755") || dataStr.toLowerCase().includes("a9965755")) {
            errorMessage = "Error: El producto no se pudo agregar al carrito. Verifica que existe, está activo y tiene stock disponible.";
          } else if (dataStr.includes("ProductNotFound") || dataStr.includes("product not found")) {
            errorMessage = "El producto no existe o no está activo.";
          } else if (dataStr.includes("InsufficientStock") || dataStr.includes("insufficient stock")) {
            errorMessage = "No hay suficiente stock disponible para este producto.";
          } else if (dataStr.includes("execution reverted")) {
            errorMessage = "La transacción fue revertida. El producto podría no estar disponible o no tener stock suficiente.";
          } else {
            errorMessage = "Error al interactuar con el contrato. Verifica que el producto existe, está activo y tiene stock disponible.";
          }
        } else {
          errorMessage = "Error al interactuar con el contrato. Verifica que el producto existe y está disponible.";
        }
      } else if (err.transaction || err.receipt) {
        // Transacción revertida
        errorMessage = "La transacción fue revertida por el contrato. El producto podría no estar disponible o no tener stock suficiente.";
      }
      
      console.error("Error detallado:", {
        code: err.code,
        message: err.message,
        reason: err.reason,
        data: err.data,
        transaction: err.transaction
      });
      
      // Mostrar mensaje de error visual
      const errorDiv = document.createElement("div");
      errorDiv.className = "fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in";
      errorDiv.innerHTML = `
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <div class="flex-1">
            <p class="font-bold mb-1">Error al agregar producto</p>
            <p class="text-sm">${errorMessage}</p>
            ${detailedError && detailedError !== errorMessage ? `<p class="text-xs mt-2 opacity-90">${detailedError}</p>` : ''}
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        errorDiv.remove();
      }, 6000);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl shadow-soft p-12 text-center animate-fade-in">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="glass rounded-2xl shadow-soft p-12 text-center animate-fade-in">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-gray-500 text-lg font-medium">No hay productos disponibles</p>
        <p className="text-gray-400 text-sm mt-2">Las empresas aún no han agregado productos al catálogo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Catálogo de Productos
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const company = companies.get(product.companyId);
          const isAdding = addingToCart === product.productId;
          const isOutOfStock = product.stock === BigInt(0);
          
          return (
            <div key={product.productId.toString()} className="glass rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="p-6">
                <div className="mb-3">
                  {company && (
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{company.name}</p>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">{product.description}</p>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatEurt(product.price)} EURT
                    </p>
                    <p className={`text-xs font-semibold mt-1 ${
                      isOutOfStock ? "text-red-600" : "text-gray-500"
                    }`}>
                      Stock: {product.stock.toString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product.productId)}
                  disabled={!walletAddress || isAdding || isOutOfStock}
                  className={`w-full px-4 py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : isAdding
                      ? "bg-indigo-400 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  }`}
                >
                  {isAdding ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agregando...
                    </>
                  ) : isOutOfStock ? (
                    "Agotado"
                  ) : !walletAddress ? (
                    "Conecta tu billetera"
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Agregar al Carrito
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

