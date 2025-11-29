# Guía: Cómo usar 2 wallets diferentes en MetaMask

## 🎯 Método 1: Crear una nueva cuenta (MÁS FÁCIL)

### Paso a Paso:

1. **Abre MetaMask**
   - Haz clic en el ícono del zorro (🦊) en tu navegador

2. **Ve a tu cuenta actual**
   - En la parte superior verás el nombre de tu cuenta (ej: "Account 1")
   - Al lado verás 3 puntos (⋮) o un ícono de cuenta

3. **Crea una nueva cuenta**
   - Haz clic en los 3 puntos (⋮) junto al nombre
   - O haz clic en el ícono de cuenta redondo en la esquina superior derecha
   - Selecciona **"Crear cuenta"** o **"Create account"**

4. **Nombra tu cuenta**
   - Te pedirá un nombre (ej: "Cuenta Cliente" o "Cuenta Empresa")
   - Escribe un nombre descriptivo

5. **¡Listo!**
   - Ahora tienes 2 cuentas en MetaMask
   - Puedes verlas haciendo clic en el nombre de la cuenta

6. **Cambiar entre cuentas**
   - Haz clic en el nombre de la cuenta en la parte superior
   - Selecciona la cuenta que quieras usar
   - Cada cuenta tiene su propia dirección y balance

---

## 🎯 Método 2: Importar una cuenta existente

Si ya tienes otra wallet y conoces su clave privada:

1. Abre MetaMask
2. Haz clic en los 3 puntos (⋮) o el ícono de cuenta
3. Selecciona **"Importar cuenta"** o **"Import account"**
4. Ingresa la clave privada de la wallet
5. Dale un nombre
6. ¡Listo!

---

## ✅ Cómo usar las 2 wallets en tu proyecto

### Wallet 1 - Cliente (para comprar):
- **Dónde usarla**: `http://localhost:6004` (Tienda Online)
- **Función**: Comprar productos
- **Qué pasa**: El balance se **reduce** cuando compras

### Wallet 2 - Empresa (para vender):
- **Dónde usarla**: `http://localhost:6003` (Web Admin)
- **Función**: 
  - Registrar la empresa
  - Agregar productos
  - Recibir pagos
- **Qué pasa**: El balance **aumenta** cuando alguien compra

---

## 📋 Ejemplo Práctico

```
Wallet 1 (Cliente): 0xf39F...2266
├─ Balance inicial: 1,000,000 EURT
├─ Compra producto de 10 EURT
└─ Balance final: 999,990 EURT ✅ (se redujo)

Wallet 2 (Empresa): 0x1234...5678
├─ Balance inicial: 0 EURT
├─ Cliente compra producto de 10 EURT
└─ Balance final: 10 EURT ✅ (aumentó)
```

---

## 🔄 Cómo cambiar de wallet en las aplicaciones

1. **En Web Admin (localhost:6003)**:
   - Haz clic en "Desconectar"
   - Cambia de cuenta en MetaMask
   - Haz clic en "Conectar MetaMask" de nuevo

2. **En Tienda (localhost:6004)**:
   - Haz clic en "Salir"
   - Cambia de cuenta en MetaMask
   - Haz clic en "Conectar" de nuevo

---

## ⚠️ Importante

- Cada wallet tiene su propia dirección y balance
- No mezcles las wallets (Cliente para comprar, Empresa para vender)
- Si usas la misma wallet para ambas cosas, el balance no cambiará
- MetaMask guarda todas tus cuentas en el mismo lugar, solo cambias entre ellas

---

## 💡 Consejo

Puedes nombrar las cuentas en MetaMask para identificarlas fácilmente:
- "Cliente" o "Customer"
- "Empresa" o "Company"

Así será más fácil saber cuál usar en cada momento.

