# Guía de Empaquetado para Distribución

Este documento explica cómo empaquetar SPIMForce CRM para distribución.

## 📦 Preparación del Paquete de Instalación

### Estructura del Paquete

El paquete de distribución debe contener:

```
spimforce-installer/
├── install.js          # Script de instalación
├── package.json        # Configuración del instalador
├── INSTALAR.bat       # Instalador para Windows
└── README.md          # Documentación
```

### Pasos para Crear el Paquete

1. **Crear una carpeta para el instalador**
   ```bash
   mkdir spimforce-installer
   cd spimforce-installer
   ```

2. **Copiar archivos del instalador**
   - Copie todos los archivos de la carpeta `/home/claude/installer/` a `spimforce-installer/`

3. **Crear el paquete completo con el código fuente**
   
   El usuario debe recibir DOS carpetas:
   
   a) **spimforce-installer/** - Contiene el instalador
   b) **spimforce/** - Contiene el código fuente completo de la aplicación
   
   Para preparar el paquete completo:
   
   ```bash
   # Desde el directorio raíz de tu proyecto
   
   # 1. Clonar el repositorio o copiar todo el código
   git clone https://github.com/elcharles25/SPIMForce.git spimforce
   cd spimforce
   
   # 2. Eliminar archivos innecesarios para distribución
   rm -rf node_modules/
   rm -rf .git/
   rm -rf dist/
   rm -rf runtime/
   rm .env
   
   # 3. Volver al directorio padre y copiar el instalador
   cd ..
   cp -r /home/claude/installer/ spimforce-installer/
   
   # 4. Crear archivo ZIP para distribución
   zip -r spimforce-v1.0.zip spimforce/ spimforce-installer/
   ```

## 📋 Checklist Pre-Distribución

Antes de distribuir, verificar:

- [ ] Todo el código fuente está incluido en `spimforce/`
- [ ] La carpeta `node_modules/` NO está incluida (se instalará durante la instalación)
- [ ] El archivo `.env` NO está incluido (se creará durante la instalación)
- [ ] La carpeta `runtime/` NO está incluida (se creará durante la instalación)
- [ ] Los archivos del instalador están en `spimforce-installer/`
- [ ] El README.md tiene instrucciones claras
- [ ] El script INSTALAR.bat funciona correctamente

## 🚀 Proceso de Instalación para el Usuario Final

1. El usuario descarga y extrae el archivo ZIP
2. Obtiene dos carpetas:
   - `spimforce/` - Código fuente de la aplicación
   - `spimforce-installer/` - Instalador

3. El usuario navega a `spimforce-installer/`
4. Ejecuta `INSTALAR.bat` (Windows) o `node install.js`
5. El instalador:
   - Verifica requisitos
   - Solicita la API Key
   - Instala dependencias en `spimforce/`
   - Crea la base de datos
   - Configura todo automáticamente

## 📝 Instrucciones para el Usuario

Incluya estas instrucciones en el archivo ZIP:

```
INSTRUCCIONES DE INSTALACIÓN
============================

1. Extraiga todo el contenido del archivo ZIP en una carpeta

2. Asegúrese de tener instalado:
   - Node.js 18 o superior (https://nodejs.org/)
   - Microsoft Outlook configurado

3. Obtenga su API Key de Google Gemini:
   - Visite: https://aistudio.google.com/app/apikey
   - Cree una API Key
   - Téngala lista para ingresarla durante la instalación

4. Ejecute la instalación:
   - Navegue a la carpeta "spimforce-installer"
   - Ejecute el archivo "INSTALAR.bat"
   - Siga las instrucciones en pantalla

5. Una vez completada la instalación:
   - Vaya a la carpeta "spimforce"
   - Ejecute "start.bat" para iniciar la aplicación
   - La aplicación se abrirá en http://localhost:8080

Para más información, consulte README.md en ambas carpetas.
```

## 🔄 Actualización de Versiones

Para crear una nueva versión:

1. **Actualizar el código**
   ```bash
   cd spimforce
   git pull origin main
   # O actualizar manualmente los archivos modificados
   ```

2. **Actualizar número de versión**
   - En `package.json` del proyecto principal
   - En `package.json` del instalador
   - En los archivos de documentación

3. **Crear nuevo paquete**
   ```bash
   # Seguir los pasos de "Pasos para Crear el Paquete" arriba
   # Nombrar el archivo: spimforce-v1.1.zip (con nuevo número de versión)
   ```

## 📂 Estructura Final del Paquete Distribuible

```
spimforce-v1.0.zip
├── spimforce/                    # Código fuente de la aplicación
│   ├── backend/
│   │   ├── db-server.js
│   │   └── email-server.js
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── spimforce-installer/          # Instalador
│   ├── install.js
│   ├── package.json
│   ├── INSTALAR.bat
│   └── README.md
│
└── INSTRUCCIONES.txt              # Instrucciones básicas de instalación
```

## 🔐 Consideraciones de Seguridad

1. **NUNCA incluir:**
   - Archivos `.env` con API Keys
   - Bases de datos con datos reales
   - Carpeta `node_modules`
   - Carpeta `.git` (si se incluye, el usuario podría ver el historial)

2. **Siempre verificar:**
   - Que no hay credenciales en el código
   - Que los archivos sensibles están en `.gitignore`
   - Que el instalador solicita las credenciales al usuario

## 📊 Testing del Paquete

Antes de distribuir, probar el paquete completo:

1. Extraer el ZIP en una máquina limpia (o VM)
2. Ejecutar el instalador
3. Verificar que todos los servicios inician correctamente
4. Probar las funcionalidades principales:
   - Crear contacto
   - Crear campaña
   - Enviar email de prueba
   - Acceder al dashboard
   - Analizar con Gemini

5. Verificar que no hay errores en consola

## 📝 Notas de Versión

Mantener un archivo CHANGELOG.md con:

```markdown
# Changelog

## [1.0.0] - 2025-01-XX

### Añadido
- Sistema completo de CRM
- Gestión de campañas
- Integración con Outlook
- Análisis con IA (Gemini)
- Dashboard de métricas

### Características
- Gestión de contactos
- Plantillas de campañas
- Seguimiento de oportunidades
- Distribución de webinars
```

## 🎯 Siguiente Paso

Una vez creado el paquete:

1. Probarlo completamente
2. Crear la documentación de usuario
3. Preparar videos tutoriales (opcional)
4. Distribuir a los usuarios finales

## ✅ Checklist Final

- [ ] Paquete ZIP creado
- [ ] Instrucciones incluidas
- [ ] Instalador probado
- [ ] Documentación actualizada
- [ ] Sin archivos sensibles
- [ ] Versión etiquetada en Git
- [ ] Listo para distribución
