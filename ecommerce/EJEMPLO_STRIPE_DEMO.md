# Ejemplo: Configuración de Stripe para Demo

## Modal de Bienvenida - Qué Poner

Cuando te aparezca el modal de bienvenida de Stripe después del registro, aquí están las opciones:

### ✅ Opción Recomendada: Omitir

**La forma más rápida:**
- Haz clic en **"Omitir por ahora"** (Skip for now)
- Esto te lleva directamente al dashboard
- No necesitas completar nada más para empezar a usar Stripe en modo de prueba

### 📝 Opción Alternativa: Completar con Datos de Demo

Si prefieres completar el formulario, usa estos valores de ejemplo:

```
Nombre de la empresa: E-Commerce Blockchain Demo
Sitio web de la empresa: http://localhost:6001
```

**O cualquier variación:**
```
Nombre: Mi Tienda Demo
Sitio web: http://localhost:6001
```

```
Nombre: Tienda Blockchain
Sitio web: (dejar vacío - es opcional)
```

## Campos del Formulario

### Campo 1: Nombre de la empresa

**Ejemplos válidos:**
- `E-Commerce Demo`
- `Mi Tienda Blockchain`
- `Tienda de Prueba`
- `Test Store`
- `Demo Store`

**Puede ser cualquier nombre** - Solo es para identificación interna de Stripe.

### Campo 2: Sitio web (Opcional)

**Opciones:**
1. **Dejar vacío** - Perfectamente válido
2. **URL local**: `http://localhost:6001`
3. **URL de ejemplo**: `https://example.com`
4. **URL del proyecto**: Si tienes una URL de desarrollo

**💡 No es necesario** - Este campo es completamente opcional y solo ayuda a Stripe a hacer recomendaciones personalizadas.

## Después del Modal

Una vez que hayas omitido o completado el formulario:

1. ✅ Verás el dashboard de Stripe
2. ✅ Estarás en "Test mode" automáticamente
3. ✅ Puedes ir directamente a obtener tus API keys

## Resumen Rápido

**Para desarrollo rápido:**
1. Haz clic en **"Omitir por ahora"**
2. Continúa con la obtención de API keys

**Si prefieres completarlo:**
1. Nombre: `E-Commerce Blockchain Demo`
2. Sitio web: `http://localhost:6001` (o vacío)
3. Haz clic en **"Continuar"**

**¡No te preocupes por los valores exactos!** Puedes cambiarlos más adelante en la configuración de tu cuenta si es necesario.

## Pantalla de Funcionalidades

Si después aparece la pantalla **"¿Cómo quieres empezar?"**:

✅ **Marca solo:**
- **"Pagos no recurrentes"** (Non-recurring payments)

❌ **No marques:**
- Pagos recurrentes
- Facturas
- Marketplace
- Otros

Luego haz clic en **"Continuar"**.

## Próximo Paso

Después de estos pasos, continúa con:
→ Obtener tus API keys (Developers → API keys)

