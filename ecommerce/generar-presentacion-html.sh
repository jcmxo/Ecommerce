#!/bin/bash

# Script para generar una presentación HTML a partir del Markdown

echo "🎨 Generando presentación HTML..."

# Verificar si pandoc está instalado
if ! command -v pandoc &> /dev/null; then
    echo "⚠️  Pandoc no está instalado. Instalando dependencias alternativas..."
    
    # Crear HTML básico con las imágenes
    cat > presentacion/presentacion.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Commerce con Blockchain y Stablecoins</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin: 30px 0 20px 0;
        }
        h2 {
            color: #764ba2;
            margin: 25px 0 15px 0;
            padding-top: 20px;
        }
        h3 {
            color: #555;
            margin: 20px 0 10px 0;
        }
        img {
            max-width: 100%;
            height: auto;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin: 15px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #667eea;
            color: white;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .toc {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .toc ul {
            list-style: none;
            padding-left: 20px;
        }
        .toc a {
            color: #667eea;
            text-decoration: none;
        }
        .toc a:hover {
            text-decoration: underline;
        }
        hr {
            border: none;
            border-top: 2px solid #ddd;
            margin: 30px 0;
        }
        .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛒 E-Commerce con Blockchain y Stablecoins</h1>
        <h2>Sistema Completo de Comercio Electrónico Descentralizado</h2>
        
        <div class="toc">
            <h3>📋 Tabla de Contenidos</h3>
            <ul>
                <li><a href="#intro">1. Introducción</a></li>
                <li><a href="#arquitectura">2. Arquitectura del Sistema</a></li>
                <li><a href="#aplicaciones">3. Aplicaciones del Proyecto</a></li>
                <li><a href="#tecnologias">4. Tecnologías Utilizadas</a></li>
                <li><a href="#flujo">5. Flujo de Trabajo Completo</a></li>
                <li><a href="#demo">6. Demostración Visual</a></li>
                <li><a href="#conclusiones">7. Conclusiones</a></li>
            </ul>
        </div>
        
        <p><strong>Nota:</strong> Esta es una versión simplificada. Para la versión completa con todas las imágenes, abre el archivo <code>PRESENTACION.md</code> en un visor de Markdown o usa pandoc para convertir a HTML/PDF.</p>
        
        <div class="footer">
            <p>Presentación generada automáticamente - Diciembre 2024</p>
            <p>Para ver todas las imágenes, consulta el archivo PRESENTACION.md</p>
        </div>
    </div>
</body>
</html>
EOF
    echo "✅ HTML básico creado en presentacion/presentacion.html"
    echo "💡 Para una versión completa, instala pandoc: sudo apt-get install pandoc"
else
    # Usar pandoc para convertir Markdown a HTML
    pandoc PRESENTACION.md -o presentacion/presentacion.html \
        --standalone \
        --css=https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css \
        --metadata title="E-Commerce con Blockchain y Stablecoins" \
        --toc \
        --toc-depth=3
    
    echo "✅ Presentación HTML generada en presentacion/presentacion.html"
fi

echo ""
echo "📂 Archivos generados:"
echo "   - presentacion/presentacion.html"
echo "   - presentacion/imagenes/ (42 imágenes)"
echo ""
echo "🌐 Para ver la presentación:"
echo "   Abre presentacion/presentacion.html en tu navegador"

