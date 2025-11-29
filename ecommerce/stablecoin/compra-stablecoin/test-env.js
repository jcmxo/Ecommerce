// Script de prueba para verificar variables de entorno
require('dotenv').config({ path: '.env' });
console.log('NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS);
console.log('Longitud:', process.env.NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS?.length || 0);
