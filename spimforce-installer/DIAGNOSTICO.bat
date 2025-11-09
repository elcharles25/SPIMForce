@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        DIAGNÓSTICO DEL SISTEMA - SPIMFORCE CRM           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script recopilará información de diagnóstico
echo para ayudar a resolver problemas de instalación.
echo.
echo Generando reporte...
echo.

set "REPORT_FILE=diagnostico-spimforce.txt"

REM Crear archivo de reporte
echo ════════════════════════════════════════════════════════════ > "%REPORT_FILE%"
echo   REPORTE DE DIAGNÓSTICO - SPIMFORCE CRM >> "%REPORT_FILE%"
echo   Fecha: %DATE% %TIME% >> "%REPORT_FILE%"
echo ════════════════════════════════════════════════════════════ >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Información del sistema
echo [INFORMACIÓN DEL SISTEMA] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type" >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

echo [USUARIO Y PERMISOS] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
echo Usuario actual: %USERNAME% >> "%REPORT_FILE%"
whoami /groups | findstr /C:"BUILTIN\Administrators" >> "%REPORT_FILE%" 2>nul
if %ERRORLEVEL% equ 0 (
    echo Permisos: Administrador >> "%REPORT_FILE%"
) else (
    echo Permisos: Usuario estándar >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Verificar Node.js
echo [NODE.JS] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Estado: Instalado >> "%REPORT_FILE%"
    for /f "tokens=*" %%i in ('node --version 2^>nul') do echo Versión: %%i >> "%REPORT_FILE%"
    for /f "tokens=*" %%i in ('where node 2^>nul') do echo Ruta: %%i >> "%REPORT_FILE%"
) else (
    echo Estado: NO INSTALADO >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Verificar npm
echo [NPM] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Estado: Instalado >> "%REPORT_FILE%"
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do echo Versión: %%i >> "%REPORT_FILE%"
    for /f "tokens=*" %%i in ('where npm 2^>nul') do echo Ruta: %%i >> "%REPORT_FILE%"
    echo. >> "%REPORT_FILE%"
    echo Configuración de npm: >> "%REPORT_FILE%"
    npm config get registry >> "%REPORT_FILE%" 2>nul
    npm config get proxy >> "%REPORT_FILE%" 2>nul
    npm config get https-proxy >> "%REPORT_FILE%" 2>nul
) else (
    echo Estado: NO INSTALADO >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Verificar Microsoft Outlook
echo [MICROSOFT OUTLOOK] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
set "OUTLOOK_FOUND=NO"
if exist "C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_FOUND=SI"
if exist "C:\Program Files (x86)\Microsoft Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_FOUND=SI"
echo Estado: %OUTLOOK_FOUND% >> "%REPORT_FILE%"
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Office\16.0\Outlook" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Registro: Encontrado >> "%REPORT_FILE%"
) else (
    echo Registro: No encontrado >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Variables de entorno PATH
echo [VARIABLES DE ENTORNO - PATH] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
echo %PATH% | findstr /I "node" >> "%REPORT_FILE%"
if %ERRORLEVEL% neq 0 (
    echo Node.js NO está en PATH >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Directorio actual
echo [DIRECTORIO ACTUAL] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
echo %CD% >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"
echo Archivos en el directorio: >> "%REPORT_FILE%"
dir /B >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Verificar archivos necesarios
echo [ARCHIVOS DEL INSTALADOR] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
if exist "install.js" (
    echo install.js: ✓ Presente >> "%REPORT_FILE%"
) else (
    echo install.js: ✗ FALTANTE >> "%REPORT_FILE%"
)
if exist "package.json" (
    echo package.json: ✓ Presente >> "%REPORT_FILE%"
) else (
    echo package.json: ✗ FALTANTE >> "%REPORT_FILE%"
)
if exist "INSTALAR.bat" (
    echo INSTALAR.bat: ✓ Presente >> "%REPORT_FILE%"
) else (
    echo INSTALAR.bat: ✗ FALTANTE >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Espacio en disco
echo [ESPACIO EN DISCO] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
for /f "tokens=3" %%a in ('dir /-c ^| findstr /C:"bytes free"') do echo Espacio libre: %%a bytes >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Conexión a Internet
echo [CONEXIÓN A INTERNET] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
ping -n 1 8.8.8.8 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Estado: Conectado >> "%REPORT_FILE%"
) else (
    echo Estado: No se pudo verificar >> "%REPORT_FILE%"
)
ping -n 1 registry.npmjs.org >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo NPM Registry: Accesible >> "%REPORT_FILE%"
) else (
    echo NPM Registry: No accesible >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Firewall y antivirus
echo [SEGURIDAD] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
netsh advfirewall show currentprofile | findstr "State" >> "%REPORT_FILE%"
wmic /namespace:\\root\securitycenter2 path antivirusproduct get displayname 2>nul >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Intentar npm cache verify
echo [CACHÉ DE NPM] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    npm cache verify >> "%REPORT_FILE%" 2>&1
) else (
    echo npm no disponible para verificar caché >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Logs recientes de npm (si existen)
echo [LOGS RECIENTES DE NPM] >> "%REPORT_FILE%"
echo ──────────────────────────────────────────────────────────── >> "%REPORT_FILE%"
if exist "%APPDATA%\npm-cache\_logs" (
    echo Directorio de logs: %APPDATA%\npm-cache\_logs >> "%REPORT_FILE%"
    dir /B /O-D "%APPDATA%\npm-cache\_logs" 2>nul | findstr "debug" >> "%REPORT_FILE%"
) else (
    echo No se encontraron logs de npm >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Finalizar reporte
echo ════════════════════════════════════════════════════════════ >> "%REPORT_FILE%"
echo   FIN DEL REPORTE >> "%REPORT_FILE%"
echo ════════════════════════════════════════════════════════════ >> "%REPORT_FILE%"

echo.
echo ✅ Reporte de diagnóstico generado
echo.
echo Archivo: %REPORT_FILE%
echo Ubicación: %CD%\%REPORT_FILE%
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo RESUMEN:
echo ────────

REM Mostrar resumen en pantalla
echo.
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do echo ✓ Node.js: %%i
) else (
    echo ✗ Node.js: NO INSTALADO
)

where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do echo ✓ npm: %%i
) else (
    echo ✗ npm: NO INSTALADO
)

if exist "install.js" (
    echo ✓ install.js presente
) else (
    echo ✗ install.js FALTANTE
)

if exist "package.json" (
    echo ✓ package.json presente
) else (
    echo ✗ package.json FALTANTE
)

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo PRÓXIMOS PASOS:
echo.
echo 1. Revise el archivo %REPORT_FILE%
echo 2. Consulte TROUBLESHOOTING.md para soluciones
echo 3. Si necesita ayuda, envíe este reporte al soporte técnico
echo.

REM Ofrecer abrir el reporte
choice /M "¿Desea abrir el reporte ahora"
if not errorlevel 2 (
    notepad "%REPORT_FILE%"
)

echo.
pause
