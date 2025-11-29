"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getEcommerceContract, formatEurt } from "@/lib/contracts";

interface ShoppingCartProps {
  walletAddress: string;
  onClose: () => void;
  refreshTrigger?: number;
}

interface CartItem {
  productId: bigint;
  quantity: bigint;
}

interface Cart {
  customer: string;
  items: CartItem[];
  createdAt: bigint;
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

export default function ShoppingCart({ walletAddress, onClose, refreshTrigger }: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Map<bigint, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (walletAddress) {
      loadCart();
    }
  }, [walletAddress, refreshTrigger]);

  const loadCart = async () => {
    if (!window.ethereum) return;

    try {
      setLoading(true);
      setError("");
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Usar un signer para asegurar que msg.sender sea el address correcto
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);

      // Intentar cargar el carrito con reintentos para manejar problemas de sincronización
      let cartData = null;
      let lastError: any = null;
      
      // Intentar hasta 5 veces con delays incrementales
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          console.log(`🔍 Intento ${attempt}/5 de cargar el carrito...`);
          cartData = await contract.getCart();
          console.log("✅ Carrito cargado exitosamente:", {
            customer: cartData.customer,
            itemsCount: cartData.items?.length || 0,
            items: cartData.items
          });
          setCart(cartData);
          
          // Si llegamos aquí, el carrito se cargó exitosamente
          lastError = null;
          break;
        } catch (err: any) {
          console.error(`❌ Intento ${attempt}/5 - Error al obtener carrito:`, err);
          lastError = err;
          
          // Si es CartNotFound, puede ser un problema de sincronización
          // Intentar de nuevo después de un delay
          if (err.code === "CALL_EXCEPTION") {
            const errorData = err.data || err.message || "";
            const errorStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            
            if (errorStr.includes("CartNotFound") || errorStr.includes("0xa9965755") || errorStr.includes("a9965755")) {
              if (attempt < 5) {
                // Esperar antes de reintentar (delay incremental)
                const delay = 1000 * attempt; // 1s, 2s, 3s, 4s
                console.log(`⏳ Carrito no encontrado. Esperando ${delay}ms antes de reintentar...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Reintentar
              } else {
                // Después de 5 intentos, asumir que el carrito está vacío
                console.log("ℹ️ Carrito no encontrado después de múltiples intentos. Inicializando como vacío.");
                setCart({ customer: walletAddress, items: [], createdAt: BigInt(0) });
                setError("");
                return;
              }
            }
          }
          
          // Si es un error RPC, intentar de nuevo
          if (err.code === -32603 || err.message?.includes("Internal JSON-RPC error")) {
            if (attempt < 5) {
              const delay = 1000 * attempt;
              console.log(`⏳ Error RPC. Esperando ${delay}ms antes de reintentar...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue; // Reintentar
            } else {
              // Después de 5 intentos, mostrar error pero permitir ver el carrito vacío
              console.error("❌ Error RPC persistente después de múltiples intentos.");
              setError("Error de conexión con la blockchain. El carrito podría no cargarse correctamente. Verifica que MetaMask esté conectado a 'Anvil Local' y que Anvil esté corriendo.");
              setCart({ customer: walletAddress, items: [], createdAt: BigInt(0) });
              return;
            }
          }
          
          // Para otros errores, no reintentar
          break;
        }
      }
      
      // Si después de todos los intentos no tenemos cartData, usar el último error
      if (!cartData && lastError) {
        throw lastError;
      }
      
      if (!cartData) {
        // Fallback: carrito vacío
        setCart({ customer: walletAddress, items: [], createdAt: BigInt(0) });
        return;
      }

      // Cargar información de productos
      const productsMap = new Map<bigint, Product>();
      for (const item of cartData.items) {
        try {
          const product = await contract.getProduct(item.productId);
          productsMap.set(item.productId, product);
        } catch (err) {
          console.error("Error loading product:", err);
        }
      }
      setProducts(productsMap);
    } catch (err: any) {
      console.error("Error loading cart:", err);
      
      // Manejar errores específicos
      if (err.code === "CALL_EXCEPTION") {
        // Si el carrito está vacío o no existe, eso es normal
        if (err.data?.includes("0xa9965755")) {
          // Error personalizado que indica carrito vacío
          setCart({ customer: walletAddress, items: [], createdAt: BigInt(0) });
          setError("");
        } else {
          setError("Error al cargar el carrito. Verifica la conexión con el contrato.");
        }
      } else {
        setError("Error al cargar el carrito: " + (err.message || "Error desconocido"));
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart) return BigInt(0);
    let total = BigInt(0);
    for (const item of cart.items) {
      const product = products.get(item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  };

  const handleCheckout = async () => {
    if (!window.ethereum || !cart || cart.items.length === 0) return;

    setCreatingInvoice(true);
    setError("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getEcommerceContract(signer);

      console.log("🔍 Verificando condiciones antes de crear factura...");
      
      // Validaciones previas antes de crear la factura
      try {
        // Verificar que el carrito tiene items
        if (!cart.items || cart.items.length === 0) {
          throw new Error("El carrito está vacío. Agrega productos antes de proceder al pago.");
        }
        
        console.log(`📦 Carrito tiene ${cart.items.length} item(s)`);
        
        // Verificar que todos los productos existen y tienen stock
        for (const item of cart.items) {
          try {
            const product = await contract.getProduct(item.productId);
            console.log(`✅ Producto ${item.productId}: ${product.name}, Stock: ${product.stock}, Cantidad solicitada: ${item.quantity}`);
            
            if (!product.isActive) {
              throw new Error(`El producto "${product.name}" no está activo.`);
            }
            
            if (product.stock < item.quantity) {
              throw new Error(`No hay suficiente stock para "${product.name}". Stock disponible: ${product.stock}, Cantidad solicitada: ${item.quantity}.`);
            }
          } catch (productError: any) {
            if (productError.code === "CALL_EXCEPTION") {
              throw new Error(`El producto con ID ${item.productId.toString()} no existe o no se pudo obtener su información.`);
            }
            throw productError;
          }
        }
        
        // Verificar que todos los productos son de la misma empresa
        if (cart.items.length > 1) {
          let firstCompanyId: bigint | null = null;
          for (const item of cart.items) {
            const product = await contract.getProduct(item.productId);
            if (firstCompanyId === null) {
              firstCompanyId = product.companyId;
            } else if (product.companyId !== firstCompanyId) {
              throw new Error("Todos los productos del carrito deben ser de la misma empresa. Por favor, crea carritos separados para productos de diferentes empresas.");
            }
          }
          
          // Verificar que la empresa está activa
          if (firstCompanyId !== null) {
            try {
              const company = await contract.getCompany(firstCompanyId);
              if (!company.isActive) {
                throw new Error(`La empresa "${company.name}" no está activa.`);
              }
              console.log(`✅ Empresa activa: ${company.name}`);
            } catch (companyError: any) {
              if (companyError.code === "CALL_EXCEPTION") {
                throw new Error(`La empresa no existe o no se pudo obtener su información.`);
              }
              throw companyError;
            }
          }
        }
        
        console.log("✅ Todas las validaciones pasaron. Creando factura...");
      } catch (validationError: any) {
        console.error("❌ Error en validaciones previas:", validationError);
        throw validationError;
      }

      // Crear invoice
      console.log("🚀 Enviando transacción para crear factura...");
      let tx;
      try {
        tx = await contract.createInvoice();
        console.log("✅ Transacción enviada, hash:", tx.hash);
      } catch (txError: any) {
        console.error("❌ Error al enviar transacción:", txError);
        
        // Intentar decodificar el error
        if (txError.code === "UNPREDICTABLE_GAS_LIMIT" || txError.code === "ACTION_REJECTED" || txError.reason) {
          // Si hay un reason, usarlo directamente
          if (txError.reason) {
            throw new Error(txError.reason);
          }
          
          // Intentar decodificar el error data
          if (txError.data) {
            const errorData = txError.data;
            const errorStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            
            // Verificar selectores de errores conocidos
            if (errorStr.includes("EmptyCart") || errorStr.includes("0x")) {
              throw new Error("El carrito está vacío. Agrega productos antes de proceder al pago.");
            } else if (errorStr.includes("InsufficientStock")) {
              throw new Error("No hay suficiente stock para uno o más productos. Verifica el stock disponible.");
            } else if (errorStr.includes("CompanyNotActive")) {
              throw new Error("La empresa no está activa. Contacta al administrador.");
            } else if (errorStr.includes("ProductNotFound")) {
              throw new Error("Uno o más productos no existen o no están disponibles.");
            }
          }
          
          // Si es ACTION_REJECTED, el usuario canceló
          if (txError.code === "ACTION_REJECTED") {
            throw new Error("Transacción cancelada por el usuario.");
          }
          
          throw new Error(txError.message || "Error al crear la factura. Por favor, verifica que el carrito tenga productos válidos y que haya suficiente stock.");
        }
        
        throw txError;
      }
      
      console.log("⏳ Esperando confirmación de la transacción...");
      const receipt = await tx.wait();
      console.log("✅ Transacción confirmada:", receipt.transactionHash);

      // Buscar el evento InvoiceCreated para obtener el invoiceId
      const invoiceCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "InvoiceCreated";
        } catch {
          return false;
        }
      });

      let invoiceId: bigint | null = null;
      if (invoiceCreatedEvent) {
        try {
          const parsed = contract.interface.parseLog(invoiceCreatedEvent);
          invoiceId = parsed?.args[0];
        } catch (err) {
          console.error("Error parsing event:", err);
        }
      }

      // Si no encontramos el evento, intentar obtener el invoiceId de otra forma
      if (!invoiceId) {
        // Obtener el último invoice del cliente
        const invoices = await contract.getCustomerInvoices();
        if (invoices.length > 0) {
          invoiceId = invoices[invoices.length - 1];
        }
      }

      if (invoiceId) {
        // Obtener información de la factura para pasar a la pasarela
        try {
          const invoice = await contract.getInvoice(invoiceId);
          const company = await contract.getCompany(invoice.companyId);
          
          // Obtener la URL de la tienda para redirigir después del pago
          const redirectUrl = window.location.origin;
          
          // Formatear el monto
          const amountInEurt = formatEurt(invoice.totalAmount);
          
          // Redirigir a la pasarela de pago con todos los parámetros necesarios
          const paymentGatewayUrl = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || "http://localhost:6002";
          const params = new URLSearchParams({
            invoice: invoiceId.toString(),
            merchant_address: company.companyAddress,
            amount: amountInEurt,
            redirect: redirectUrl
          });
          
          console.log("🔗 Redirigiendo a pasarela de pagos:", `${paymentGatewayUrl}?${params.toString()}`);
          window.location.href = `${paymentGatewayUrl}?${params.toString()}`;
        } catch (invoiceError: any) {
          console.error("Error obteniendo información de la factura:", invoiceError);
          // Fallback: redirigir solo con el invoiceId (la pasarela puede obtener los datos)
          const paymentGatewayUrl = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || "http://localhost:6002";
          console.log("🔗 Redirigiendo a pasarela de pagos (fallback):", `${paymentGatewayUrl}?invoice=${invoiceId.toString()}`);
          window.location.href = `${paymentGatewayUrl}?invoice=${invoiceId.toString()}`;
        }
      } else {
        throw new Error("No se pudo obtener el ID de la factura");
      }
    } catch (err: any) {
      console.error("❌ Error en checkout:", err);
      
      let errorMessage = "Error al crear la factura";
      
      // Intentar decodificar errores del contrato
      if (err.code === "CALL_EXCEPTION" || err.code === "UNPREDICTABLE_GAS_LIMIT") {
        const errorData = err.data || err.message || "";
        const errorStr = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
        
        // Verificar selectores de errores conocidos
        if (errorStr.includes("EmptyCart") || errorStr.includes("0x")) {
          errorMessage = "El carrito está vacío. Agrega productos antes de proceder al pago.";
        } else if (errorStr.includes("InsufficientStock")) {
          errorMessage = "No hay suficiente stock para uno o más productos. Por favor, verifica el stock disponible y ajusta las cantidades.";
        } else if (errorStr.includes("CompanyNotActive")) {
          errorMessage = "La empresa no está activa. Por favor, contacta al administrador.";
        } else if (errorStr.includes("ProductNotFound")) {
          errorMessage = "Uno o más productos no existen o no están disponibles. Por favor, verifica tu carrito.";
        } else if (err.reason) {
          errorMessage = err.reason;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err.code === "ACTION_REJECTED") {
        errorMessage = "Transacción cancelada por el usuario.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Error detallado:", {
        code: err.code,
        message: err.message,
        reason: err.reason,
        data: err.data
      });
    } finally {
      setCreatingInvoice(false);
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
          <p className="text-gray-600 font-medium">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (error && (!cart || cart.items.length === 0)) {
    return (
      <div className="glass rounded-2xl shadow-soft p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Carrito de Compras
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="glass rounded-2xl shadow-soft p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Carrito de Compras
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center py-12">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">Tu carrito está vacío</p>
          <p className="text-gray-400 text-sm">Agrega productos desde el catálogo</p>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="glass rounded-2xl shadow-soft p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Carrito de Compras
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {cart.items.map((item, index) => {
          const product = products.get(item.productId);
          if (!product) return null;

          return (
            <div key={index} className="flex justify-between items-center p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600">
                  Cantidad: <span className="font-semibold">{item.quantity.toString()}</span> × <span className="font-semibold text-indigo-600">{formatEurt(product.price)} EURT</span>
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatEurt(product.price * item.quantity)} EURT
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-indigo-200 pt-6 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">Total:</span>
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {formatEurt(total)} EURT
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={creatingInvoice}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-bold text-lg flex items-center justify-center gap-2"
      >
        {creatingInvoice ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Proceder al Pago
          </>
        )}
      </button>
    </div>
  );
}

