import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Función para crear un icono
async function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.32}" fill="white" opacity="0.25"/>
      <text x="${size/2}" y="${size/2 + size*0.12}" 
            font-family="Arial, sans-serif" 
            font-size="${size * 0.35}" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            dominant-baseline="middle">CC</text>
    </svg>
  `;

  const outputPath = path.join(distDir, `icon${size}.png`);
  
  try {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Creado icon${size}.png (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`✗ Error creando icon${size}.png:`, error.message);
    return false;
  }
}

// Crear todos los iconos
async function createAllIcons() {
  console.log('Creando iconos para la extensión...\n');
  
  const sizes = [16, 48, 128];
  let success = 0;
  
  for (const size of sizes) {
    const result = await createIcon(size);
    if (result) success++;
  }
  
  console.log(`\n✅ ${success}/${sizes.length} iconos creados exitosamente`);
  
  if (success === sizes.length) {
    console.log('\n🎉 ¡Todos los iconos están listos en la carpeta dist/!');
  } else {
    console.log('\n⚠️  Algunos iconos no se pudieron crear. Revisa los errores arriba.');
  }
}

createAllIcons().catch(console.error);

