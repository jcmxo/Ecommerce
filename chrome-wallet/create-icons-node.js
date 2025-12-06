// Script para crear iconos PNG simples usando Node.js
const fs = require('fs');
const path = require('path');

// PNG mínimo válido con datos base64
// Este es un PNG 16x16 simple con fondo azul púrpura y texto "CC"
function createSimplePNG(size) {
  // PNG header + IHDR + IDAT + IEND
  // Para simplificar, crearemos un PNG básico usando un template
  // Nota: Este es un PNG mínimo válido de un color sólido
  
  const width = size;
  const height = size;
  
  // Crear datos RGB para el icono (color #667eea)
  const r = 0x66;
  const g = 0x7e;
  const b = 0xea;
  
  // PNG signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Para crear un PNG válido, necesitamos usar una librería o crear uno muy básico
  // Como alternativa, vamos a crear un SVG y luego intentar convertirlo
  // O mejor, crear un PNG usando un método más directo
  
  // Método: Crear un PNG básico de un solo color
  // Esto requiere compresión zlib, así que mejor creamos SVG primero
  return null;
}

// Crear SVG y luego intentar convertirlo, o crear PNGs básicos
function createSVGIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="white" opacity="0.3"/>
  <text x="${size/2}" y="${size/2 + size*0.15}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle">CC</text>
</svg>`;
}

// Intentar usar sharp o canvas si están disponibles, sino crear SVG
function createIcons() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const sizes = [16, 48, 128];
  let created = 0;

  // Intentar usar sharp (si está instalado)
  try {
    const sharp = require('sharp');
    sizes.forEach(size => {
      const svg = createSVGIcon(size);
      const outputPath = path.join(distDir, `icon${size}.png`);
      
      sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(outputPath)
        .then(() => {
          console.log(`✓ Creado ${outputPath}`);
          created++;
        })
        .catch(err => {
          console.error(`Error creando ${outputPath}:`, err.message);
        });
    });
    return;
  } catch (e) {
    // sharp no está disponible
  }

  // Intentar usar canvas (si está instalado)
  try {
    const { createCanvas } = require('canvas');
    sizes.forEach(size => {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Fondo con degradado
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Círculo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size * 0.35, 0, 2 * Math.PI);
      ctx.fill();
      
      // Texto "CC"
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CC', size/2, size/2);
      
      const outputPath = path.join(distDir, `icon${size}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Creado ${outputPath}`);
      created++;
    });
    return;
  } catch (e) {
    // canvas no está disponible
  }

  // Si no hay librerías, crear SVGs y dar instrucciones
  console.log('⚠️  No se encontraron librerías de imagen (sharp o canvas)');
  console.log('Creando archivos SVG como alternativa...');
  
  sizes.forEach(size => {
    const svg = createSVGIcon(size);
    const svgPath = path.join(distDir, `icon${size}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`✓ Creado ${svgPath} (necesitas convertirlo a PNG)`);
  });
  
  console.log('\nPara convertir SVG a PNG, puedes:');
  console.log('1. Usar una herramienta online: https://cloudconvert.com/svg-to-png');
  console.log('2. Instalar sharp: npm install sharp');
  console.log('3. Usar ImageMagick: convert icon16.svg icon16.png');
}

createIcons();

