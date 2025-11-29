# Pasarela de Pagos

Aplicación Next.js que permite pagar con EuroTokens entre clientes y comerciantes.

## Características

- ✅ Pago con EuroToken
- ✅ Conexión con MetaMask
- ✅ Aprobación de gasto de tokens
- ✅ Integración con contrato Ecommerce
- ✅ Redirección automática después del pago

## Parámetros URL

```
http://localhost:6002/?
  merchant_address=0x...      # Dirección del comerciante
  amount=100.50              # Monto en EUR
  invoice=INV-001            # ID de factura
  date=2025-10-15            # Fecha
  redirect=http://...        # URL de retorno
```

## Flujo de Pago

1. Usuario es redirigido desde tienda con datos de pago
2. Conecta MetaMask
3. Confirma monto y destinatario
4. Aprueba transferencia de tokens al contrato Ecommerce
5. Se ejecuta pago a través del contrato Ecommerce
6. Redirige de vuelta a la tienda

## Variables de Entorno

```env
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0x...
RPC_URL=http://localhost:8545
```

## Desarrollo

```bash
npm install
npm run dev
# La aplicación estará en http://localhost:6002
```

## Pendiente de Implementar

- [ ] UI de pago con detalles
- [ ] Verificación de saldo suficiente
- [ ] Aprobación de tokens
- [ ] Llamada a processPayment del contrato
- [ ] Manejo de errores
- [ ] Redirección después del pago

