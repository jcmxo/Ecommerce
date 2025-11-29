#!/bin/bash

cd /mnt/c/Users/jcmxo/ecommerce/web-admin

PORT=6003

# Función para matar procesos en el puerto
kill_port() {
    echo "🔍 Buscando procesos en puerto $PORT..."
    # Intentar varias formas de encontrar y matar el proceso
    PID=$(lsof -ti:$PORT 2>/dev/null || fuser $PORT/tcp 2>/dev/null | awk '{print $1}' || echo "")
    
    if [ ! -z "$PID" ]; then
        echo "⚠️  Encontrado proceso $PID en puerto $PORT. Deteniendo..."
        kill -9 $PID 2>/dev/null
        sleep 2
    fi
    
    # Matar todos los procesos node relacionados con next
    pkill -9 -f "next.*$PORT" 2>/dev/null
    pkill -9 -f "node.*$PORT" 2>/dev/null
    sleep 1
}

# Limpiar caché
echo "🧹 Limpiando caché de Next.js..."
rm -rf .next
echo "✅ Caché limpiada"
echo ""

# Intentar liberar el puerto
kill_port

# Verificar si el puerto está libre
if lsof -ti:$PORT >/dev/null 2>&1 || fuser $PORT/tcp >/dev/null 2>&1; then
    echo "⚠️  ADVERTENCIA: El puerto $PORT aún está ocupado."
    echo "   Por favor, detén manualmente cualquier proceso usando ese puerto."
    echo "   En Windows, puedes usar: netstat -ano | findstr :6003"
    echo "   Luego usar: taskkill /PID <PID> /F"
    echo ""
    read -p "¿Quieres continuar de todas formas? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Cancelado."
        exit 1
    fi
fi

echo ""
echo "🚀 Iniciando servidor de desarrollo en puerto $PORT..."
echo "📝 Los logs se guardarán en server-logs.txt"
echo ""
echo "💡 TIP: Abre otra terminal y ejecuta: tail -f server-logs.txt"
echo "   O presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor y capturar logs
npm run dev 2>&1 | tee server-logs.txt
