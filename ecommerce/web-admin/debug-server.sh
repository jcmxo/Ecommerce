#!/bin/bash
cd /mnt/c/Users/jcmxo/ecommerce/web-admin
echo "🧹 Limpiando caché..."
rm -rf .next
echo "✅ Caché limpiada"
echo ""
echo "🚀 Iniciando servidor en puerto 6005..."
echo "📝 Los logs se guardarán en: server-error.log"
echo ""
echo "💡 INSTRUCCIONES:"
echo "   1. Espera a que veas 'Ready' en los logs"
echo "   2. Abre en tu navegador: http://localhost:6005"
echo "   3. O prueba: http://localhost:6005/test"
echo "   4. Cuando veas el error, presiona Ctrl+C"
echo "   5. Los errores estarán en: server-error.log"
echo ""
npx next dev -p 6005 2>&1 | tee server-error.log
