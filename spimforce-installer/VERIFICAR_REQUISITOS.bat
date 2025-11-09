@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ═══════════════════════════════════════════════════════════════
echo            VERIFICACIÓN DE REQUISITOS PREVIOS
echo                    SPIMFORCE CRM v1.0
echo ═══════════════════════════════════════════════════════════════
echo.

set "ALL_OK=1"

REM Verificar Node.js
echo [1/4] Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    ✅ Node.js encontrado: !NODE_VERSION!
    
    REM Extraer versión mayor
    set VERSION_STR=!NODE_VERSION:v=!
    for /f "tokens=1 delims=." %%a in ("!VERSION_STR!") do set MAJOR_VERSION=%%a
    
    if !MAJOR_VERSION! LSS 18 (
        echo    ⚠️  ADVERTENCIA: Se recomienda Node.js v18 o superior
        echo       Versión actual: !NODE_VERSION!
        echo       Por favor, actualice desde: https://nodejs.org/
        set "ALL_OK=0"
    )
) else (
    echo    ❌ Node.js NO encontrado
    echo       Descargue e instale desde: https://nodejs.org/
    echo       Elija la versión LTS (Long Term Support^)
    set "ALL_OK=0"
)
echo.

REM Verificar npm
echo [2/4] Verificando npm...
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo    ✅ npm encontrado: v!NPM_VERSION!
) else (
    echo    ❌ npm NO encontrado
    echo       Reinstale Node.js desde: https://nodejs.org/
    set "ALL_OK=0"
)
echo.

REM Verificar Outlook
echo [3/4] Verificando Microsoft Outlook...
set "OUTLOOK_FOUND=0"

REM Buscar Outlook en rutas comunes
if exist "C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_FOUND=1"
if exist "C:\Program Files (x86)\Microsoft Office\root\Office16\OUTLOOK.EXE" set "OUTLOOK_FOUND=1"
if exist "C:\Program Files\Microsoft Office\Office16\OUTLOOK.EXE" set "OUTLOOK_FOUND=1"
if exist "C:\Program Files (x86)\Microsoft Office\Office16\OUTLOOK.EXE" set "OUTLOOK_FOUND=1"

REM Buscar en registro
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Office\16.0\Outlook" >nul 2>nul
if %ERRORLEVEL% equ 0 set "OUTLOOK_FOUND=1"

reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Office\16.0\Outlook" >nul 2>nul
if %ERRORLEVEL% equ 0 set "OUTLOOK_FOUND=1"

if !OUTLOOK_FOUND! equ 1 (
    echo    ✅ Microsoft Outlook encontrado
) else (
    echo    ⚠️  Microsoft Outlook NO detectado
    echo       Nota: Outlook es necesario para funciones de email
    echo       Si ya está instalado, puede continuar de todos modos
    set "ALL_OK=0"
)
echo.

REM Verificar conexión a Internet
echo [4/4] Verificando conexión a Internet...
ping -n 1 8.8.8.8 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo    ✅ Conexión a Internet activa
) else (
    echo    ⚠️  No se pudo verificar la conexión a Internet
    echo       Nota: Se requiere Internet para descargar dependencias
    set "ALL_OK=0"
)
echo.

REM Resumen
echo ═══════════════════════════════════════════════════════════════
echo                        RESUMEN
echo ═══════════════════════════════════════════════════════════════
echo.

if !ALL_OK! equ 1 (
    echo ✅ TODOS LOS REQUISITOS CUMPLIDOS
    echo.
    echo Está listo para instalar SPIMForce CRM.
    echo.
    echo Siguiente paso:
    echo    Ejecute el archivo INSTALAR.bat
    echo.
) else (
    echo ⚠️  ALGUNOS REQUISITOS NO SE CUMPLEN
    echo.
    echo Por favor, instale/configure los elementos faltantes
    echo antes de continuar con la instalación.
    echo.
)

echo ═══════════════════════════════════════════════════════════════
echo.

REM Recordatorio sobre API Key
echo 📝 RECORDATORIO:
echo    Necesitará una Google Gemini API Key durante la instalación
echo    Obtener gratis en: https://aistudio.google.com/app/apikey
echo.

pause
