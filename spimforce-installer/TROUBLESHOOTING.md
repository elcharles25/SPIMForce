# GUÍA DE SOLUCIÓN DE PROBLEMAS - INSTALADOR SPIMFORCE

## 🚨 PROBLEMA: El instalador se cierra después de verificar npm

### Síntomas
- El instalador muestra "✅ Node.js encontrado"
- El instalador muestra "✅ npm encontrado"
- Luego se cierra inmediatamente sin más mensajes

### Causas Posibles

1. **Error durante `npm install` que no se muestra**
2. **Falta el archivo package.json en el directorio del instalador**
3. **Permisos insuficientes**
4. **Antivirus bloqueando npm**

### Soluciones

#### Solución 1: Ejecutar con más información de debug

1. Abra CMD como administrador
2. Navegue a la carpeta del instalador:
   ```cmd
   cd ruta\a\spimforce-installer
   ```
3. Ejecute manualmente cada paso:
   ```cmd
   npm install
   ```
4. Observe si hay errores en npm install
5. Si funciona, ejecute:
   ```cmd
   node install.js
   ```

#### Solución 2: Verificar archivos necesarios

Asegúrese de que estos archivos existen en la carpeta:
- `install.js` ✓
- `package.json` ✓
- `INSTALAR.bat` ✓

Si falta alguno, vuelva a descargar el instalador.

#### Solución 3: Verificar que está en el directorio correcto

El instalador debe ejecutarse desde:
```
spimforce-installer/    ← Ejecutar INSTALAR.bat AQUÍ
├── install.js
├── package.json
└── INSTALAR.bat
```

NO desde:
```
spimforce/              ← NO ejecutar aquí
└── spimforce-installer/
```

#### Solución 4: Ejecutar como administrador

1. Click derecho en `INSTALAR.bat`
2. Seleccionar "Ejecutar como administrador"
3. Aceptar el UAC

#### Solución 5: Desactivar temporalmente el antivirus

Algunos antivirus bloquean npm silenciosamente:
1. Desactive temporalmente su antivirus
2. Ejecute el instalador
3. Vuelva a activar el antivirus

#### Solución 6: Limpiar caché de npm

```cmd
npm cache clean --force
npm cache verify
```

Luego vuelva a ejecutar el instalador.

---

## 🚨 PROBLEMA: Error "Node.js no está instalado" cuando sí está instalado

### Síntomas
- Tiene Node.js instalado
- El comando `node --version` funciona
- El instalador dice que no está instalado

### Causas
- Variables de entorno no actualizadas
- Instalación de Node.js incompleta

### Soluciones

#### Solución 1: Reiniciar CMD
1. Cierre todas las ventanas de CMD
2. Abra una nueva ventana de CMD
3. Ejecute: `node --version`
4. Si funciona, ejecute el instalador

#### Solución 2: Verificar PATH

1. Abra PowerShell como administrador
2. Ejecute:
   ```powershell
   $env:PATH -split ';' | Select-String node
   ```
3. Debería ver rutas como:
   - `C:\Program Files\nodejs\`

Si no aparece:
1. Busque "Editar las variables de entorno del sistema"
2. Click en "Variables de entorno"
3. En "Variables del sistema", busque "Path"
4. Verifique que existe: `C:\Program Files\nodejs\`
5. Si no existe, añádala

#### Solución 3: Reinstalar Node.js

1. Use el script `INSTALAR_NODEJS.bat` incluido
2. O descargue desde https://nodejs.org/
3. Durante la instalación, asegúrese de marcar "Add to PATH"

---

## 🚨 PROBLEMA: Error durante `npm install`

### Síntomas
- El instalador se detiene en "Instalando dependencias"
- Mensajes de error de npm

### Causas Comunes

#### Error: EACCES (Permisos)
```
Error: EACCES: permission denied
```

**Solución**:
1. Ejecute CMD como administrador
2. O cambie permisos de la carpeta:
   ```cmd
   icacls . /grant %USERNAME%:(OI)(CI)F /T
   ```

#### Error: ENOTFOUND (Sin Internet)
```
Error: getaddrinfo ENOTFOUND registry.npmjs.org
```

**Solución**:
1. Verifique su conexión a Internet
2. Si está detrás de un proxy, configure npm:
   ```cmd
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

#### Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE
```
Error: unable to verify the first certificate
```

**Solución**:
```cmd
npm config set strict-ssl false
```

#### Error: ENOSPC (Sin espacio)
```
Error: ENOSPC: no space left on device
```

**Solución**:
1. Libere espacio en disco
2. O limpie caché de npm:
   ```cmd
   npm cache clean --force
   ```

#### Error: Timeout
```
Error: network timeout at 'https://registry.npmjs.org/...'
```

**Solución**:
```cmd
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
```

---

## 🚨 PROBLEMA: Error al crear la base de datos

### Síntomas
- Error: "No se pudo crear la base de datos"
- Error con better-sqlite3

### Soluciones

#### Solución 1: Instalar herramientas de compilación

En Windows, better-sqlite3 necesita herramientas de compilación:

```cmd
npm install --global windows-build-tools
```

O instale Visual Studio Build Tools desde:
https://visualstudio.microsoft.com/downloads/

Marque "Desktop development with C++"

#### Solución 2: Usar versión precompilada

```cmd
npm install better-sqlite3 --build-from-source=false
```

#### Solución 3: Permisos de escritura

Verifique que tiene permisos para crear archivos en:
```
spimforce/runtime/data/
```

---

## 🚨 PROBLEMA: El instalador se congela

### Síntomas
- El instalador se queda "colgado" sin avanzar
- No responde, no se cierra

### Soluciones

1. **Espere**: `npm install` puede tardar 5-10 minutos
2. **Verifique conexión**: Algunos paquetes son grandes
3. **Presione Ctrl+C**: Si lleva más de 15 minutos
4. **Limpie e intente de nuevo**:
   ```cmd
   npm cache clean --force
   del /s /q node_modules
   rmdir /s /q node_modules
   ```
   Luego ejecute el instalador nuevamente

---

## 🚨 PROBLEMA: Instalación de Node.js automática falla

### Síntomas
- Error al descargar Node.js
- Error al instalar Node.js

### Soluciones

#### Si falla la descarga:

1. **Descargar manualmente**:
   - Visite https://nodejs.org/
   - Descargue el instalador LTS para Windows
   - Ejecute el .msi descargado

2. **Verificar firewall**:
   - Permita conexiones a nodejs.org
   - Desactive temporalmente el firewall

3. **Usar proxy** (si está en red corporativa):
   ```powershell
   $proxy = 'http://proxy.company.com:8080'
   [System.Net.WebRequest]::DefaultWebProxy = New-Object System.Net.WebProxy($proxy)
   ```

#### Si falla la instalación:

1. **Ejecutar como administrador**:
   - El .msi debe ejecutarse con permisos elevados

2. **Desinstalar versión anterior**:
   - Panel de Control → Desinstalar programas
   - Busque Node.js
   - Desinstale completamente
   - Reinicie
   - Instale la nueva versión

---

## 📋 Checklist de Verificación Pre-Instalación

Antes de reportar un problema, verifique:

- [ ] Node.js v18 o superior instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Tiene permisos de administrador
- [ ] Tiene conexión a Internet
- [ ] Tiene al menos 500MB libres en disco
- [ ] Antivirus no está bloqueando npm
- [ ] Está en el directorio correcto (spimforce-installer/)
- [ ] Los archivos install.js y package.json existen

---

## 🛠️ Instalación Manual (Si todo lo demás falla)

Si el instalador automático no funciona, puede instalar manualmente:

### Paso 1: Instalar Node.js
1. Descargar desde https://nodejs.org/
2. Instalar (marcar "Add to PATH")
3. Reiniciar CMD

### Paso 2: Preparar la aplicación
```cmd
cd ruta\a\spimforce
```

### Paso 3: Instalar dependencias
```cmd
npm install
```

### Paso 4: Crear estructura de directorios
```cmd
mkdir runtime
mkdir runtime\data
mkdir runtime\attachments
mkdir runtime\pdfs
```

### Paso 5: Crear base de datos

Ejecute el script Python:
```cmd
python init_db.py
```

O si no tiene Python, use el código JavaScript para crear la DB.

### Paso 6: Crear archivo .env

Cree un archivo `.env` con:
```
VITE_GOOGLE_GEMINI_API_KEY="su_api_key_aqui"
DATABASE_URL=postgresql://postgres:Gartner@localhost:5432/spimforce
PORT=3001
VITE_API_URL=http://localhost:3001
```

### Paso 7: Crear scripts de inicio

Cree `start.bat` con el contenido del script de inicio.

### Paso 8: Iniciar
```cmd
start.bat
```

---

## 📞 Soporte

Si después de seguir esta guía sigue teniendo problemas:

1. Anote el error exacto que aparece
2. Tome captura de pantalla
3. Anote:
   - Versión de Windows
   - Versión de Node.js
   - Paso exacto donde falla
4. Contacte al soporte técnico

---

**Versión del documento**: 1.0
**Última actualización**: Noviembre 2025
