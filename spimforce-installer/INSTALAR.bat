@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:MainMenu
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          INSTALADOR DE SPIMFORCE CRM v1.0                  ║
echo ║        Sistema de Gestión de Campañas y Contactos          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar si Node.js está instalado
echo [1/5] Verificando instalación de Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Node.js no está instalado
    echo.
    echo Intentando descargar e instalar Node.js automáticamente...
    echo.
    call :InstallNodeJS
    if !ERRORLEVEL! equ 2 (
        REM El usuario está instalando manualmente Node.js
        echo.
        echo ══════════════════════════════════════════════════════════
        echo   ESPERANDO INSTALACIÓN DE NODE.JS
        echo ══════════════════════════════════════════════════════════
        echo.
        echo Por favor, complete la instalación de Node.js que se ha abierto.
        echo.
        echo Una vez finalizada la instalación:
        echo   - Presione cualquier tecla para continuar
        echo.
        pause
        
        REM Refrescar variables de entorno sin cerrar la ventana
        echo.
        echo Refrescando variables de entorno...
        call :RefreshEnv
        
        REM Volver a verificar Node.js
        where node >nul 2>nul
        if !ERRORLEVEL! neq 0 (
            echo.
            echo ⚠️  Node.js aún no está disponible en el PATH
            echo.
            echo Opciones:
            echo   1. Presione cualquier tecla para verificar nuevamente
            echo   2. Si el problema persiste, cierre esta ventana,
            echo      abra una nueva ventana de comandos y ejecute INSTALAR.bat
            echo.
            pause
            goto MainMenu
        )
        
        echo ✅ Node.js detectado correctamente
        echo.
    ) else if !ERRORLEVEL! neq 0 (
        echo.
        echo Por favor, descargue e instale Node.js manualmente desde:
        echo https://nodejs.org/
        echo.
        echo Después de la instalación, presione cualquier tecla para continuar
        pause
        goto MainMenu
    )
)

for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VER=%%i
echo       Node.js %NODE_VER%
echo       ✅ Node.js encontrado
echo.

REM Verificar si npm está instalado
echo [2/5] Verificando npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo       ❌ npm no encontrado
    echo       Por favor, reinstale Node.js
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VER=%%i
echo       npm %NPM_VER%
echo       ✅ npm encontrado
echo.

REM Instalar dependencias del instalador
echo [3/5] Instalando dependencias del instalador...
echo       (Esto puede tardar unos minutos^)
echo.
echo       Ejecutando: npm install
echo       En directorio: %CD%
echo.

call npm install 2>&1
set INSTALL_ERROR=%ERRORLEVEL%

echo.
echo       Resultado del comando npm install: %INSTALL_ERROR%
echo.
if %INSTALL_ERROR% neq 0 (
    echo       ❌ Error instalando dependencias (Código: %INSTALL_ERROR%^)
    echo       Verifique su conexión a Internet
    echo.
    pause
    exit /b 1
)
echo       ✅ Dependencias instaladas
echo.

REM Verificar que install.js existe
echo [4/5] Verificando archivos del instalador...
if not exist "install.js" (
    echo       ❌ Error: No se encontró install.js
    echo       Asegúrese de estar en la carpeta correcta
    echo.
    pause
    exit /b 1
)
echo       ✅ Archivos verificados
echo.

REM Ejecutar el instalador
echo [5/5] Iniciando proceso de instalación...
echo.
echo ════════════════════════════════════════════════════════════
echo.
node install.js
set NODE_ERROR=%ERRORLEVEL%
echo.
echo ════════════════════════════════════════════════════════════

if %NODE_ERROR% equ 0 (
    echo.
    echo ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE
    echo.
    echo Próximos pasos:
    echo   1. Vaya al escritorio y ejecute el acceso directo SPIMForce
    echo   2. O ejecute start.bat en la carpeta spimforce
    echo   3. La aplicación se abrirá en http://localhost:8080
    echo.
) else (
    echo.
    echo ❌ LA INSTALACIÓN ENCONTRÓ ERRORES
    echo    Código de error: %NODE_ERROR%
    echo.
    echo Consulte los mensajes anteriores para más detalles
    echo.
)

echo ════════════════════════════════════════════════════════════
echo.
pause
exit /b %NODE_ERROR%

:InstallNodeJS
echo.
echo ══════════════════════════════════════════════════════════
echo   INSTALACIÓN AUTOMÁTICA DE NODE.JS
echo ══════════════════════════════════════════════════════════
echo.
echo Descargando Node.js LTS...
echo (Esto puede tardar varios minutos dependiendo de su conexión^)
echo.

REM Crear carpeta temporal
set "TEMP_DIR=%TEMP%\spimforce-installer"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Determinar arquitectura
set "NODE_ARCH=x64"
if "%PROCESSOR_ARCHITECTURE%"=="x86" set "NODE_ARCH=x86"

REM Descargar Node.js usando PowerShell
set "NODE_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-%NODE_ARCH%.msi"
set "NODE_MSI=%TEMP_DIR%\nodejs-installer.msi"

echo Descargando desde: %NODE_URL%
echo.

powershell -Command "$ProgressPreference = 'SilentlyContinue'; try { Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_MSI%' -UseBasicParsing; exit 0 } catch { Write-Host 'Error: No se pudo descargar Node.js'; exit 1 }"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Error descargando Node.js
    echo.
    exit /b 1
)

if not exist "%NODE_MSI%" (
    echo ❌ Error: El archivo de instalación no se descargó correctamente
    exit /b 1
)

echo ✅ Descarga completada
echo.
echo Instalando Node.js...
echo (Esto requiere permisos de administrador^)
echo.

REM Instalar Node.js silenciosamente
msiexec /i "%NODE_MSI%" /qn /norestart

if %ERRORLEVEL% neq 0 (
    echo.
    echo ⚠️  La instalación automática requiere permisos de administrador
    echo.
    echo Abriendo instalador manual...
    start "" /wait "%NODE_MSI%"
    echo.
    REM Retornar código 2 para indicar instalación manual completada
    exit /b 2
)

echo.
echo ✅ Node.js instalado correctamente
echo.
exit /b 0

:RefreshEnv
REM Refrescar variables de entorno PATH sin cerrar la ventana
echo Actualizando PATH desde el registro...

REM Leer PATH del sistema
for /f "skip=2 tokens=3*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SystemPath=%%a %%b"

REM Leer PATH del usuario
for /f "skip=2 tokens=3*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "UserPath=%%a %%b"

REM Combinar ambos PATHs
set "PATH=%SystemPath%;%UserPath%"

REM Agregar rutas comunes de Node.js si no están
if not "!PATH:%ProgramFiles%\nodejs=!" == "!PATH!" (
    echo Node.js ya está en PATH del sistema
) else (
    set "PATH=%PATH%;%ProgramFiles%\nodejs"
)

if not "!PATH:%APPDATA%\npm=!" == "!PATH!" (
    echo npm global ya está en PATH
) else (
    set "PATH=%PATH%;%APPDATA%\npm"
)

echo ✅ Variables de entorno actualizadas
goto :eof