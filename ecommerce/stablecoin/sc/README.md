# EuroToken Smart Contract

ERC20 token representing digital euros (1 EURT = 1 EUR). Stablecoin backed 1:1 with EUR, perfect for stable transactions in the DeFi ecosystem.

## Características

- **Estándar ERC20**: Compatible con todos los wallets y exchanges
- **6 decimales**: Permite representar centavos de euro
- **Función mint**: Solo el owner puede crear nuevos tokens
- **Función burn**: Los usuarios pueden quemar sus propios tokens

## Contrato

### EuroToken.sol

```solidity
contract EuroToken is ERC20, Ownable {
    function decimals() public pure override returns (uint8) // Returns 6
    function mint(address to, uint256 amount) external onlyOwner
    function burn(uint256 amount) external
}
```

## Instalación

```bash
# Instalar dependencias (OpenZeppelin)
forge install OpenZeppelin/openzeppelin-contracts

# Compilar
forge build

# Tests
forge test
forge test -vvv  # Con logs detallados
```

## Tests

Los tests cubren:
- ✅ Deploy del contrato
- ✅ Mint por owner
- ✅ Mint por no-owner (debe fallar)
- ✅ Transferencias entre cuentas
- ✅ Burn de tokens
- ✅ Validaciones (cero address, cero amount)

## Deploy Local (Anvil)

```bash
# 1. Iniciar Anvil en otra terminal
anvil

# 2. Configurar variable de entorno
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 3. Deploy
forge script script/DeployEuroToken.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast \
    -vvvv
```

## Deploy en Testnet/Mainnet

```bash
# Configurar variables de entorno
export PRIVATE_KEY=your_private_key_here
export RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# Deploy
forge script script/DeployEuroToken.s.sol \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify \
    -vvvv
```

## Interactuar con el Contrato

### Ver balance
```bash
cast call CONTRACT_ADDRESS "balanceOf(address)(uint256)" USER_ADDRESS \
    --rpc-url http://localhost:8545
```

### Mint tokens (solo owner)
```bash
cast send CONTRACT_ADDRESS "mint(address,uint256)" USER_ADDRESS AMOUNT \
    --private-key OWNER_PRIVATE_KEY \
    --rpc-url http://localhost:8545
```

### Transfer tokens
```bash
cast send CONTRACT_ADDRESS "transfer(address,uint256)" RECEIVER_ADDRESS AMOUNT \
    --private-key SENDER_PRIVATE_KEY \
    --rpc-url http://localhost:8545
```

## Conversión de Valores

El token usa 6 decimales. Para convertir:

- 1 EUR = 1,000,000 unidades (10^6)
- 100 EUR = 100,000,000 unidades
- 0.50 EUR = 500,000 unidades

Ejemplo en Solidity:
```solidity
uint256 amountInEur = 100; // 100 EUR
uint256 amountInTokens = amountInEur * 10**6; // 100,000,000 unidades
```

## Eventos

- `TokensMinted(address indexed to, uint256 amount)`: Emitido cuando se crean nuevos tokens

## Seguridad

- ✅ Usa OpenZeppelin para las implementaciones base (batalla probada)
- ✅ Control de acceso con `onlyOwner` para mint
- ✅ Validaciones de address y amounts
- ✅ Funcionalidad de burn para reducir oferta

## Licencia

MIT

