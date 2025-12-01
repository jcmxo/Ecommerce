# 📊 Presentación del Proyecto E-Commerce

## 📁 Estructura de Archivos

```
presentacion/
├── README.md              # Este archivo
├── presentacion.html      # Versión HTML (generar con script)
└── imagenes/              # 42 capturas de pantalla
    ├── image1.png
    ├── image2.png
    ...
    └── image42.png
```

## 🚀 Cómo Usar la Presentación

### Opción 1: Ver Markdown Directamente

Abre el archivo `PRESENTACION.md` en la raíz del proyecto con:
- **VS Code** (con extensión Markdown Preview)
- **Typora**
- **Mark Text**
- Cualquier editor que soporte Markdown

### Opción 2: Generar HTML

Ejecuta el script de generación:

```bash
cd /mnt/c/Users/jcmxo/ecommerce
./generar-presentacion-html.sh
```

Luego abre `presentacion/presentacion.html` en tu navegador.

### Opción 3: Convertir a PowerPoint/PDF

#### Con Pandoc (Recomendado)

```bash
# Instalar pandoc (si no está instalado)
sudo apt-get install pandoc

# Convertir a PDF
pandoc PRESENTACION.md -o presentacion/presentacion.pdf --pdf-engine=xelatex

# Convertir a PowerPoint (requiere pandoc 2.19+)
pandoc PRESENTACION.md -o presentacion/presentacion.pptx
```

#### Con Markdown a PPT Online

1. Abre `PRESENTACION.md` en un editor online como:
   - [Dillinger](https://dillinger.io/)
   - [StackEdit](https://stackedit.io/)
2. Exporta a PowerPoint o PDF

### Opción 4: Usar en Presentaciones Online

Puedes importar el contenido a:
- **Google Slides**: Copia y pega las secciones
- **Prezi**: Importa el Markdown
- **Canva**: Usa las imágenes directamente

## 📸 Imágenes

Las 42 imágenes están organizadas en `presentacion/imagenes/`:

- **image1.png** - image42.png: Capturas de pantalla del sistema
- Todas las imágenes están referenciadas en `PRESENTACION.md`

## 🎨 Personalización

### Modificar el Contenido

Edita `PRESENTACION.md` en la raíz del proyecto para:
- Cambiar textos
- Reorganizar secciones
- Agregar o quitar imágenes
- Modificar descripciones

### Modificar el Estilo HTML

Edita `generar-presentacion-html.sh` para cambiar:
- Colores
- Fuentes
- Diseño
- Estilos CSS

## 📋 Secciones de la Presentación

1. **Introducción** - Visión general del proyecto
2. **Arquitectura** - Diagrama y componentes
3. **Aplicaciones** - Detalle de cada app
4. **Tecnologías** - Stack tecnológico
5. **Flujo de Trabajo** - Procesos del sistema
6. **Demostración Visual** - 42 capturas de pantalla
7. **Conclusiones** - Resumen y próximos pasos

## 🔧 Requisitos

- Navegador web (para HTML)
- Editor de Markdown (opcional)
- Pandoc (opcional, para conversión)

## 💡 Tips

1. **Para presentaciones en vivo**: Usa la versión HTML o exporta a PowerPoint
2. **Para documentación**: El Markdown es perfecto
3. **Para compartir online**: Sube el HTML a un servidor web
4. **Para impresión**: Convierte a PDF

## 📞 Soporte

Si tienes problemas:
1. Verifica que todas las imágenes estén en `presentacion/imagenes/`
2. Asegúrate de que las rutas en `PRESENTACION.md` sean correctas
3. Revisa los logs del script de generación

---

**Última actualización:** Diciembre 2024

