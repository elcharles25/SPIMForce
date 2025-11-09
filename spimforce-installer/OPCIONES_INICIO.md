# OPCIONES DE INICIO - SPIMForce CRM

## 🎯 Nueva Característica: Inicio sin Múltiples Ventanas

El instalador ahora genera **3 opciones** para iniciar la aplicación:

## 📋 Opciones Disponibles

### 1. start.bat - Ventana Única (Recomendado) ⭐

**Uso**: Doble clic en `start.bat`

**Características**:
- ✅ Ejecuta todos los servicios en UNA SOLA ventana
- ✅ Puedes ver los logs en tiempo real
- ✅ Fácil de detener (Ctrl+C o cerrar ventana)
- ✅ Usa concurrently para gestionar procesos

**Ventana que verás**:
```
===============================================
  SPIMFORCE CRM - Iniciando aplicacion
===============================================

Todos los servicios se ejecutaran en esta ventana

Para detener: Presione Ctrl+C o cierre esta ventana
              y ejecute stop.bat

===============================================

Abriendo navegador...
Iniciando servicios...

[db-server] Server listening on port 3001
[email-server] Email server on port 3002  
[frontend] VITE ready on http://localhost:8080
```

**Para detener**:
- Presiona `Ctrl+C`
- O cierra la ventana
- O ejecuta `stop.bat`

---

### 2. start-hidden.bat - Sin Ventanas (Ejecución Oculta) 🔇

**Uso**: Doble clic en `start-hidden.bat`

**Características**:
- ✅ NO se abren ventanas de CMD
- ✅ Los servicios se ejecutan en segundo plano
- ✅ Logs guardados en archivos
- ✅ Ideal para uso diario sin distracciones

**Ventana que verás** (se cierra automáticamente):
```
===============================================
  SPIMFORCE CRM - Inicio sin ventanas
===============================================

Iniciando servicios en segundo plano...
Los servicios se ejecutaran sin ventanas visibles

Logs disponibles en: runtime\logs\
  - db-server.log
  - email-server.log  
  - frontend.log

===============================================
  Servicios iniciados
===============================================

La aplicacion se abrira en: http://localhost:8080

Para detener: Ejecute stop.bat

Presione una tecla para continuar . . .
```

**Logs guardados en**:
```
spimforce/runtime/logs/
├── db-server.log      - Logs del servidor de BD
├── email-server.log   - Logs del servidor de email
└── frontend.log       - Logs del frontend
```

**Para detener**:
- Ejecuta `stop.bat`
- Es la ÚNICA forma de detenerlo (no hay ventanas que cerrar)

---

### 3. Manual - Múltiples Terminales (Desarrollo)

**Para desarrolladores** que quieren controlar cada servicio:

Terminal 1:
```cmd
node backend/db-server.js
```

Terminal 2:
```cmd
node backend/email-server.js
```

Terminal 3:
```cmd
npm run dev
```

---

## 🔍 Comparación de Opciones

| Característica | start.bat | start-hidden.bat | Manual |
|----------------|-----------|------------------|--------|
| Ventanas | 1 | 0 (oculto) | 3 |
| Logs en pantalla | ✅ Sí | ❌ No (archivo) | ✅ Sí |
| Fácil de detener | ✅ Ctrl+C | ⚠️ stop.bat | ✅ Ctrl+C |
| Ideal para | Uso general | Uso diario | Desarrollo |
| Distracción | Mínima | Ninguna | Alta |

---

## 📝 Archivos Generados por el Instalador

El instalador crea estos archivos en `spimforce/`:

1. **start.bat** - Inicio en ventana única
2. **start-hidden.bat** - Inicio oculto
3. **start-hidden.vbs** - Helper para ejecución oculta
4. **start-background.bat** - Helper para procesos en background
5. **stop.bat** - Detiene todos los servicios

---

## 🚀 Recomendación de Uso

### Para trabajo diario:
```cmd
start-hidden.bat
```
- Sin distracciones
- Limpio y profesional
- Solo ves el navegador

### Para desarrollo o debugging:
```cmd
start.bat
```
- Ves los logs en tiempo real
- Fácil ver errores
- Rápido para detener

### Para desarrollo avanzado:
```
Iniciar servicios manualmente en terminales separadas
```
- Control total de cada servicio
- Puedes reiniciar servicios individuales
- Logs separados por servicio

---

## 🛑 Cómo Detener la Aplicación

### Si usaste start.bat:
```
Opción 1: Presiona Ctrl+C en la ventana
Opción 2: Cierra la ventana
Opción 3: Ejecuta stop.bat
```

### Si usaste start-hidden.bat:
```
ÚNICA opción: Ejecuta stop.bat
```

**IMPORTANTE**: Si usaste `start-hidden.bat`, debes usar `stop.bat` porque no hay ventanas visibles que cerrar.

---

## 📊 Logs y Diagnóstico

### Con start.bat (ventana única):
Los logs se muestran directamente en la ventana. Puedes:
- Ver errores inmediatamente
- Copiar mensajes de log
- Seguir el flujo de ejecución

### Con start-hidden.bat (oculto):
Los logs se guardan en archivos:
```
runtime/logs/db-server.log      - Servidor de base de datos
runtime/logs/email-server.log   - Servidor de email
runtime/logs/frontend.log       - Frontend/Vite
```

**Ver logs en tiempo real**:
```cmd
type runtime\logs\db-server.log
type runtime\logs\email-server.log
type runtime\logs\frontend.log
```

**Ver logs continuamente** (como tail -f):
```cmd
powershell Get-Content runtime\logs\db-server.log -Wait
```

---

## ⚙️ Detalles Técnicos

### start.bat - Cómo funciona:
1. Ejecuta `npm run dev:all`
2. Usa `concurrently` (ya en package.json)
3. Combina 3 procesos en uno:
   - `node backend/db-server.js`
   - `node backend/email-server.js`
   - `npm run dev` (Vite)
4. Todo en la misma ventana con prefijos de color

### start-hidden.bat - Cómo funciona:
1. Ejecuta `start-hidden.vbs` (VBScript)
2. VBScript lanza `start-background.bat` con ventana oculta
3. `start-background.bat` inicia procesos con `start /B` (background)
4. Redirige output a archivos de log
5. Abre el navegador automáticamente

### stop.bat - Cómo funciona:
1. Busca procesos node.exe con:
   - `db-server.js` en línea de comando
   - `email-server.js` en línea de comando
   - `vite` en línea de comando
2. Termina cada proceso encontrado
3. Funciona con ambos métodos de inicio

---

## 🎨 Personalización

### Cambiar el puerto del frontend:
Edite `vite.config.ts` en la carpeta `spimforce/`

### Cambiar puertos del backend:
Edite `.env`:
```
PORT=3001  # Puerto de db-server
```

### Deshabilitar apertura automática del navegador:
En `start.bat`, comente la línea:
```bat
REM start http://localhost:8080
```

---

## 🔧 Solución de Problemas

### Los servicios no inician con start-hidden.bat:
1. Verifique logs en `runtime/logs/`
2. Busque errores en los archivos .log
3. Intente con `start.bat` para ver errores en pantalla

### stop.bat no detiene los servicios:
1. Ejecute varias veces
2. Abra Administrador de Tareas
3. Busque procesos "node.exe"
4. Ciérrelos manualmente
5. Como último recurso, reinicie el equipo

### No se abre el navegador automáticamente:
Es normal en `start-hidden.bat`, se abre después de 5 segundos.
Si no se abre, abra manualmente: http://localhost:8080

---

## ✅ Resumen

**Para uso diario**: `start-hidden.bat` (sin ventanas)

**Para desarrollo**: `start.bat` (ventana única con logs)

**Para debugging**: Inicio manual (control total)

---

**Versión**: 1.3
**Fecha**: Noviembre 2025
**Nueva característica**: ✅ Sin múltiples ventanas CMD
