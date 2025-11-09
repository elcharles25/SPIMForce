@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        INSTALADOR AUTOMÁTICO DE NODE.JS                    ║
echo ║              Para SPIMForce CRM                            ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script descargará e instalará Node.js automáticamente.
echo.

REM Verificar si Node.js ya está instalado
echo Verificando si Node.js ya está instalado...
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VER=%%i
    echo.
    echo ✅ Node.js ya está instalado: !NODE_VER!
    echo.
    echo No es necesario instalar nuevamente.
    echo.
    pause
    exit /b 0
)

echo ❌ Node.js no está instalado
echo.

REM Pedir confirmación
echo ¿Desea descargar e instalar Node.js ahora?
echo.
echo Esto descargará aproximadamente 30MB y requiere conexión a Internet.
echo La instalación puede requerir permisos de administrador.
echo.
choice /M "¿Continuar"
if errorlevel 2 (
    echo.
    echo Instalación cancelada.
    echo.
    echo Puede descargar Node.js manualmente desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo ══════════════════════════════════════════════════════════
echo   DESCARGANDO NODE.JS
echo ══════════════════════════════════════════════════════════
echo.

REM Crear carpeta temporal
set "TEMP_DIR=%TEMP%\spimforce-nodejs"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Determinar arquitectura del sistema
set "NODE_ARCH=x64"
if "%PROCESSOR_ARCHITECTURE%"=="x86" set "NODE_ARCH=x86"
echo Arquitectura detectada: %NODE_ARCH%
echo.

REM URL de descarga (Node.js LTS 20.11.0)
set "NODE_VERSION=20.11.0"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/node-v%NODE_VERSION%-%NODE_ARCH%.msi"
set "NODE_MSI=%TEMP_DIR%\nodejs-installer.msi"

echo Descargando Node.js v%NODE_VERSION%...
echo URL: %NODE_URL%
echo.
echo Por favor espere, esto puede tardar varios minutos...
echo.

REM Descargar usando PowerShell con barra de progreso
powershell -Command "& {$ProgressPreference='Continue'; try { Write-Host 'Iniciando descarga...'; $webClient = New-Object System.Net.WebClient; $webClient.DownloadFile('%NODE_URL%', '%NODE_MSI%'); Write-Host 'Descarga completada'; exit 0 } catch { Write-Host 'Error en la descarga:' $_.Exception.Message; exit 1 }}"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Error durante la descarga
    echo.
    echo Posibles causas:
    echo   - Sin conexión a Internet
    echo   - Firewall bloqueando la descarga
    echo   - URL no disponible
    echo.
    echo Puede descargar manualmente desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Verificar que el archivo se descargó
if not exist "%NODE_MSI%" (
    echo ❌ Error: El archivo no se descargó correctamente
    pause
    exit /b 1
)

echo.
echo ✅ Descarga completada exitosamente
echo.

REM Mostrar información del archivo
for %%F in ("%NODE_MSI%") do set "FILE_SIZE=%%~zF"
set /a FILE_SIZE_MB=%FILE_SIZE% / 1048576
echo Archivo descargado: %FILE_SIZE_MB% MB
echo Ubicación: %NODE_MSI%
echo.

echo ══════════════════════════════════════════════════════════
echo   INSTALANDO NODE.JS
echo ══════════════════════════════════════════════════════════
echo.
echo Instalando Node.js v%NODE_VERSION%...
echo.
echo NOTA: Esta instalación puede requerir permisos de administrador.
echo       Si se le solicita, por favor acepte.
echo.

REM Intentar instalación silenciosa primero
echo Intentando instalación automática...
msiexec /i "%NODE_MSI%" /qn /norestart /log "%TEMP_DIR%\nodejs-install.log"
set INSTALL_RESULT=%ERRORLEVEL%

if %INSTALL_RESULT% equ 0 (
    echo.
    echo ✅ Node.js instalado correctamente
    echo.
    echo ══════════════════════════════════════════════════════════
    echo   INSTALACIÓN COMPLETADA
    echo ══════════════════════════════════════════════════════════
    echo.
    echo Node.js v%NODE_VERSION% ha sido instalado en su sistema.
    echo.
    echo IMPORTANTE:
    echo   Debe cerrar y volver a abrir cualquier ventana de CMD o PowerShell
    echo   para que los cambios surtan efecto.
    echo.
    echo Próximos pasos:
    echo   1. Cierre esta ventana
    echo   2. Abra una nueva ventana de CMD
    echo   3. Ejecute INSTALAR.bat nuevamente
    echo.
    pause
    exit /b 0
)

REM Si falló la instalación silenciosa, intentar con interfaz gráfica
echo.
echo ⚠️  La instalación automática requiere permisos de administrador
echo.
echo Abriendo instalador con interfaz gráfica...
echo Por favor, siga las instrucciones en pantalla.
echo.
pause

start "" /wait "%NODE_MSI%"

echo.
echo ══════════════════════════════════════════════════════════
echo   VERIFICANDO INSTALACIÓN
echo ══════════════════════════════════════════════════════════
echo.

REM Esperar un momento para que se actualicen las variables de entorno
timeout /t 3 /nobreak > nul

REM Verificar si Node.js se instaló
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set INSTALLED_VER=%%i
    echo ✅ Node.js instalado correctamente: !INSTALLED_VER!
    echo.
    echo IMPORTANTE:
    echo   Debe cerrar y volver a abrir la ventana de CMD
    echo   para usar Node.js
    echo.
    echo Próximos pasos:
    echo   1. Cierre esta ventana
    echo   2. Abra una nueva ventana de CMD
    echo   3. Ejecute INSTALAR.bat nuevamente
    echo.
) else (
    echo.
    echo ⚠️  Node.js se instaló, pero no está disponible aún en el PATH
    echo.
    echo Por favor:
    echo   1. Cierre todas las ventanas de CMD
    echo   2. Abra una nueva ventana de CMD
    echo   3. Ejecute: node --version
    echo   4. Si funciona, ejecute INSTALAR.bat
    echo.
)

pause
exit /b 0
