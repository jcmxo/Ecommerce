#!/bin/bash
echo "🔄 Reiniciando Web Admin completamente..."
pkill -9 -f "next.*6003" 2>/dev/null
sleep 2
cd /mnt/c/Users/jcmxo/ecommerce/web-admin
rm -rf .next
echo "✅ Caché limpiada"
echo "🚀 Iniciando servidor..."
npm run dev
