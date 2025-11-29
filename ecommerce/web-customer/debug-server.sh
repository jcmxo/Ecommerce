#!/bin/bash

cd /mnt/c/Users/jcmxo/ecommerce/web-customer

echo "🧹 Limpiando caché..."
rm -rf .next

echo "✅ Caché limpiada"
echo ""
echo "🚀 Iniciando servidor en puerto 6004..."
echo "📝 Los logs se guardarán en: server-error.log"
echo ""
echo "💡 INSTRUCCIONES:"
echo "   1. Espera a que veas 'Ready' en los logs"
echo "   2. Abre en tu navegador: http://localhost:6004"
echo "   3. Cuando veas el error, presiona Ctrl+C"
echo "   4. Los errores estarán en: server-error.log"
echo ""

npx next dev -p 6004 2>&1 | tee server-error.log

