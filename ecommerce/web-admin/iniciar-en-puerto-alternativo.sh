#!/bin/bash

cd /mnt/c/Users/jcmxo/ecommerce/web-admin

PORT_ALT=6005

echo "🧹 Limpiando caché de Next.js..."
rm -rf .next
echo "✅ Caché limpiada"
echo ""

echo "🚀 Iniciando servidor en puerto ALTERNATIVO $PORT_ALT (para evitar conflicto)..."
echo "📝 Los logs se guardarán en server-logs-$PORT_ALT.txt"
echo ""
echo "💡 Visita: http://localhost:$PORT_ALT"
echo "   Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor en puerto alternativo y capturar logs
PORT=$PORT_ALT npx next dev -p $PORT_ALT 2>&1 | tee server-logs-$PORT_ALT.txt

