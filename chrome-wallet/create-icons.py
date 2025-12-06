#!/usr/bin/env python3
"""
Script para crear iconos placeholder simples para la extensión.
En producción, deberías reemplazar estos con iconos diseñados profesionalmente.
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("PIL/Pillow no está instalado. Instala con: pip install Pillow")
    print("O crea los iconos manualmente usando cualquier editor de imágenes.")

def create_icon(size, output_path):
    """Crea un icono placeholder simple."""
    if not HAS_PIL:
        return False
    
    # Crear imagen con fondo degradado
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Dibujar círculo de fondo
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], 
                 fill='#764ba2', outline='white', width=2)
    
    # Intentar agregar texto "CC"
    try:
        font_size = size // 2
        # Usar fuente por defecto
        font = ImageFont.load_default()
        text = "CC"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size - text_width) // 2, (size - text_height) // 2 - size // 10)
        draw.text(position, text, fill='white', font=font)
    except:
        pass
    
    img.save(output_path, 'PNG')
    return True

if __name__ == '__main__':
    import os
    
    dist_dir = 'dist'
    if not os.path.exists(dist_dir):
        os.makedirs(dist_dir)
    
    sizes = [16, 48, 128]
    created = 0
    
    for size in sizes:
        output_path = os.path.join(dist_dir, f'icon{size}.png')
        if create_icon(size, output_path):
            print(f'✓ Creado {output_path}')
            created += 1
        else:
            print(f'✗ No se pudo crear {output_path} (PIL no disponible)')
    
    if created == 0:
        print("\n⚠️  No se pudieron crear los iconos automáticamente.")
        print("Opciones:")
        print("1. Instala Pillow: pip install Pillow")
        print("2. Crea los iconos manualmente usando:")
        print("   - https://www.favicon-generator.org/")
        print("   - https://realfavicongenerator.net/")
        print("   - Cualquier editor de imágenes (GIMP, Photoshop, etc.)")
        print("\nTamaños necesarios: 16x16, 48x48, 128x128 píxeles")
        print("Coloca los archivos como icon16.png, icon48.png, icon128.png en la carpeta dist/")

