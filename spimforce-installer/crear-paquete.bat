@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ═══════════════════════════════════════════════════════════════
echo           SCRIPT DE EMPAQUETADO PARA DISTRIBUCIÓN
echo                    SPIMFORCE CRM v1.0
echo ═══════════════════════════════════════════════════════════════
echo.
echo Este script preparará el paquete de instalación para distribución.
echo.
echo IMPORTANTE: Ejecute este script desde el directorio raíz del proyecto
echo            (donde se encuentra la carpeta src/ y package.json)
echo.
pause

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo    Por favor, ejecute este script desde el directorio raíz del proyecto
    pause
    exit /b 1
)

if not exist "src" (
    echo ❌ Error: No se encontró la carpeta src/
    echo    Por favor, ejecute este script desde el directorio raíz del proyecto
    pause
    exit /b 1
)

echo ✅ Directorio correcto verificado
echo.

REM Crear carpeta de distribución
set "DIST_DIR=spimforce-distribution"
set "VERSION=v1.0"

echo 📁 Creando estructura de distribución...

if exist "%DIST_DIR%" (
    echo ⚠️  La carpeta %DIST_DIR% ya existe
    choice /M "¿Desea eliminarla y crear una nueva"
    if errorlevel 2 (
        echo Operación cancelada
        pause
        exit /b 0
    )
    rmdir /s /q "%DIST_DIR%"
)

mkdir "%DIST_DIR%"
mkdir "%DIST_DIR%\spimforce"
mkdir "%DIST_DIR%\spimforce-installer"

echo ✅ Estructura creada
echo.

REM Copiar código fuente (excluyendo lo innecesario)
echo 📋 Copiando código fuente de la aplicación...

REM Copiar archivos y carpetas principales
xcopy /E /I /Y "src" "%DIST_DIR%\spimforce\src\" >nul
xcopy /E /I /Y "backend" "%DIST_DIR%\spimforce\backend\" >nul
xcopy /E /I /Y "public" "%DIST_DIR%\spimforce\public\" >nul 2>nul

REM Copiar archivos de configuración
copy /Y "package.json" "%DIST_DIR%\spimforce\" >nul
copy /Y "package-lock.json" "%DIST_DIR%\spimforce\" >nul 2>nul
copy /Y "tsconfig.json" "%DIST_DIR%\spimforce\" >nul
copy /Y "vite.config.ts" "%DIST_DIR%\spimforce\" >nul
copy /Y "index.html" "%DIST_DIR%\spimforce\" >nul
copy /Y "tailwind.config.js" "%DIST_DIR%\spimforce\" >nul 2>nul
copy /Y "postcss.config.js" "%DIST_DIR%\spimforce\" >nul 2>nul

echo ✅ Código fuente copiado
echo.

REM Copiar instalador
echo 📋 Copiando archivos del instalador...

REM Asumiendo que los archivos del instalador están en una carpeta llamada "installer"
REM o que están disponibles para copiar

REM Si tienes los archivos del instalador en alguna ubicación específica, ajusta aquí
REM Por ahora, creamos un mensaje para el usuario

echo ⚠️  IMPORTANTE: Debe copiar manualmente los archivos del instalador a:
echo    %DIST_DIR%\spimforce-installer\
echo.
echo    Archivos requeridos:
echo    - install.js
echo    - package.json
echo    - INSTALAR.bat
echo    - README.md
echo    - INSTRUCCIONES.txt
echo    - VERIFICAR_REQUISITOS.bat
echo    - EMPAQUETADO.md
echo.
echo    Estos archivos fueron generados por Claude y deben estar
echo    en la carpeta de outputs.
echo.
pause

REM Crear archivo de instrucciones en el directorio principal
echo 📝 Creando archivo de instrucciones principal...

(
echo ═══════════════════════════════════════════════════════════════
echo                     SPIMFORCE CRM %VERSION%
echo             Sistema de Gestión de Campañas y Contactos
echo ═══════════════════════════════════════════════════════════════
echo.
echo CONTENIDO DEL PAQUETE
echo ─────────────────────
echo.
echo Este paquete contiene:
echo.
echo 1. spimforce/
echo    └─ Código fuente completo de la aplicación
echo.
echo 2. spimforce-installer/
echo    └─ Sistema de instalación automática
echo.
echo PASOS DE INSTALACIÓN
echo ────────────────────
echo.
echo 1. Extraiga TODO el contenido en una carpeta de su elección
echo.
echo 2. Vaya a la carpeta "spimforce-installer"
echo.
echo 3. Ejecute "VERIFICAR_REQUISITOS.bat" para verificar que su
echo    sistema cumple con los requisitos
echo.
echo 4. Ejecute "INSTALAR.bat" y siga las instrucciones
echo.
echo 5. Una vez instalado, vaya a "spimforce" y ejecute "start.bat"
echo.
echo REQUISITOS
echo ──────────
echo.
echo - Node.js 18 o superior
echo - Microsoft Outlook
echo - Google Gemini API Key
echo - Conexión a Internet
echo.
echo DOCUMENTACIÓN
echo ─────────────
echo.
echo Para instrucciones detalladas, consulte:
echo - spimforce-installer\README.md
echo - spimforce-installer\INSTRUCCIONES.txt
echo.
echo SOPORTE
echo ───────
echo.
echo Para asistencia, contacte con el administrador del sistema.
echo.
echo ═══════════════════════════════════════════════════════════════
) > "%DIST_DIR%\LEEME_PRIMERO.txt"

echo ✅ Archivo de instrucciones creado
echo.

REM Crear archivo de versión
echo %VERSION% > "%DIST_DIR%\VERSION.txt"
date /t >> "%DIST_DIR%\VERSION.txt"

echo 📊 Generando resumen...
echo.

REM Contar archivos
set "FILE_COUNT=0"
for /r "%DIST_DIR%" %%f in (*) do set /a FILE_COUNT+=1

echo ═══════════════════════════════════════════════════════════════
echo                     EMPAQUETADO COMPLETADO
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📦 Paquete creado en: %DIST_DIR%\
echo 📊 Total de archivos: !FILE_COUNT!
echo 📅 Versión: %VERSION%
echo.
echo PRÓXIMOS PASOS:
echo ───────────────
echo.
echo 1. Copie los archivos del instalador a:
echo    %DIST_DIR%\spimforce-installer\
echo.
echo 2. Revise que todo esté correcto en %DIST_DIR%\
echo.
echo 3. Comprima la carpeta %DIST_DIR% en un archivo ZIP:
echo    spimforce-%VERSION%.zip
echo.
echo 4. Distribuya el archivo ZIP a los usuarios
echo.
echo VERIFICACIÓN RECOMENDADA:
echo ─────────────────────────
echo.
echo Antes de distribuir, pruebe el paquete en una máquina limpia
echo para asegurarse de que la instalación funciona correctamente.
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

pause
