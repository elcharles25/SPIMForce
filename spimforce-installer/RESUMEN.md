# SISTEMA DE INSTALACIÓN SPIMFORCE CRM - RESUMEN EJECUTIVO

## 📦 Archivos Generados

Se han creado todos los archivos necesarios para crear un sistema de instalación completo para SPIMForce CRM.

### Ubicación
Todos los archivos están en: `/mnt/user-data/outputs/installer/`

## 📋 Lista de Archivos

1. **install.js** (Principal)
   - Script de instalación en Node.js
   - Verifica requisitos
   - Solicita API Key de Gemini
   - Crea base de datos SQLite
   - Instala dependencias
   - Configura todo el entorno

2. **package.json**
   - Configuración del instalador
   - Define dependencia de better-sqlite3

3. **INSTALAR.bat**
   - Instalador automático para Windows
   - Interfaz amigable
   - Verifica Node.js y npm
   - Ejecuta el instalador principal

4. **VERIFICAR_REQUISITOS.bat**
   - Script de verificación previa
   - Comprueba Node.js
   - Comprueba npm
   - Detecta Microsoft Outlook
   - Verifica conexión a Internet

5. **README.md**
   - Documentación completa
   - Instrucciones detalladas
   - Requisitos del sistema
   - Solución de problemas

6. **INSTRUCCIONES.txt**
   - Guía rápida de instalación
   - Formato texto plano
   - Instrucciones paso a paso

7. **EMPAQUETADO.md**
   - Guía para crear el paquete de distribución
   - Estructura del paquete
   - Checklist pre-distribución
   - Instrucciones de testing

8. **crear-paquete.bat**
   - Script automático de empaquetado
   - Crea estructura de distribución
   - Copia archivos necesarios
   - Excluye archivos innecesarios

## 🎯 Cómo Usar Este Sistema

### Paso 1: Preparar el Paquete de Distribución

1. Vaya a su repositorio de GitHub (https://github.com/elcharles25/SPIMForce)

2. Clone o descargue el código completo:
   ```bash
   git clone https://github.com/elcharles25/SPIMForce.git spimforce
   ```

3. Limpie el directorio (elimine archivos temporales):
   ```bash
   cd spimforce
   rm -rf node_modules/ dist/ runtime/ .env
   ```

4. Copie la carpeta del instalador que se generó:
   - Desde: `/mnt/user-data/outputs/installer/`
   - Hasta: Una carpeta llamada `spimforce-installer/`

5. Cree la estructura final:
   ```
   spimforce-distribution/
   ├── spimforce/              (código de GitHub limpio)
   └── spimforce-installer/    (archivos del instalador)
   ```

### Paso 2: Crear el ZIP de Distribución

**Opción A: Manual**
1. Comprima la carpeta `spimforce-distribution/` en ZIP
2. Nombre: `spimforce-v1.0.zip`

**Opción B: Con el script (Windows)**
1. Copie `crear-paquete.bat` al directorio raíz de su proyecto
2. Ejecute `crear-paquete.bat`
3. Siga las instrucciones en pantalla

### Paso 3: Distribuir a Usuarios

Envíe el archivo `spimforce-v1.0.zip` a sus usuarios con estas instrucciones:

```
1. Extraiga todo el contenido del ZIP
2. Vaya a spimforce-installer/
3. Ejecute INSTALAR.bat
4. Siga las instrucciones
5. Cuando termine, vaya a spimforce/ y ejecute start.bat
```

## 🔧 Qué Hace el Instalador

El script `install.js` realiza automáticamente:

1. ✅ Verifica que Node.js esté instalado (v18+)
2. ✅ Solicita la Google Gemini API Key al usuario
3. ✅ Crea la estructura de directorios:
   - runtime/data/
   - runtime/attachments/
   - runtime/pdfs/
4. ✅ Crea la base de datos SQLite con todas las tablas:
   - contacts
   - campaign_templates
   - campaigns
   - opportunities
   - meetings
   - settings
   - webinar_distributions
   - webinar_recommendations
5. ✅ Crea el archivo .env con la API Key proporcionada
6. ✅ Instala todas las dependencias de npm
7. ✅ Crea scripts de inicio:
   - start.bat (inicia todos los servicios)
   - stop.bat (detiene todos los servicios)
8. ✅ Genera documentación (LEEME.md)

## 📊 Estructura de la Base de Datos

La base de datos SQLite (`crm_campaigns.db`) incluye:

### Tablas Principales
- **contacts**: Gestión de contactos con todos sus datos
- **campaign_templates**: Plantillas de campañas de email
- **campaigns**: Campañas activas vinculadas a contactos
- **opportunities**: Oportunidades comerciales
- **meetings**: Reuniones asociadas a oportunidades
- **settings**: Configuración de la aplicación
- **webinar_distributions**: Distribución de webinars
- **webinar_recommendations**: Recomendaciones de webinars por rol

### Índices Automáticos
- Por contact_id en campaigns y opportunities
- Por status en campaigns y opportunities
- Por opportunity_id en meetings
- Por meeting_date en meetings

## 🚀 Scripts de Inicio Generados

### start.bat
Inicia 3 servicios en ventanas separadas:
1. Backend DB Server (puerto 3001)
2. Backend Email Server (puerto 3002)
3. Frontend (puerto 8080)

Luego abre automáticamente http://localhost:8080 en el navegador.

### stop.bat
Cierra todas las ventanas de los servicios de SPIMForce.

## 🔑 Gestión de API Keys

Durante la instalación, se solicita la Google Gemini API Key que se guarda en `.env`:

```env
VITE_GOOGLE_GEMINI_API_KEY="clave_del_usuario"
DATABASE_URL=postgresql://postgres:Gartner@localhost:5432/spimforce
PORT=3001
VITE_API_URL=http://localhost:3001
```

Los usuarios pueden cambiar la API Key editando el archivo `.env` después de la instalación.

## 📝 Documentación Incluida

Después de la instalación, el usuario tendrá:

1. **LEEME.md** (en carpeta spimforce)
   - Guía de uso completa
   - Cómo iniciar/detener la aplicación
   - Estructura de archivos
   - Solución de problemas
   - Requisitos del sistema

2. **README.md** (en carpeta spimforce-installer)
   - Instrucciones de instalación
   - Requisitos previos
   - Proceso detallado
   - FAQ

## ⚠️ Consideraciones Importantes

### Seguridad
- ✅ NO incluir archivos .env en el paquete
- ✅ NO incluir bases de datos con datos reales
- ✅ NO incluir carpeta node_modules (se instala automáticamente)
- ✅ API Keys se solicitan durante instalación

### Compatibilidad
- ✅ Windows 10/11 (probado)
- ✅ Node.js 18+ (requerido)
- ✅ Microsoft Outlook (requerido para funciones de email)

### Tamaño del Paquete
- Código fuente: ~5-10 MB
- Después de npm install: ~200-300 MB
- Base de datos vacía: <100 KB

## 🧪 Testing del Paquete

Antes de distribuir, pruebe en una máquina limpia:

1. ✅ Extraer el ZIP
2. ✅ Ejecutar VERIFICAR_REQUISITOS.bat
3. ✅ Ejecutar INSTALAR.bat
4. ✅ Verificar que se crea .env con la API Key
5. ✅ Verificar que se crea la base de datos
6. ✅ Verificar que se instalan las dependencias
7. ✅ Ejecutar start.bat
8. ✅ Verificar que abre http://localhost:8080
9. ✅ Probar funcionalidades básicas:
   - Crear contacto
   - Crear campaña
   - Ver dashboard
10. ✅ Ejecutar stop.bat

## 📞 Soporte

Si los usuarios tienen problemas:

1. Verificar requisitos con VERIFICAR_REQUISITOS.bat
2. Consultar sección "Solución de Problemas" en README.md
3. Verificar logs de instalación
4. Comprobar que puertos 3001, 3002, 8080 están disponibles

## 🎉 Resultado Final

Después de usar este sistema de instalación, los usuarios tendrán:

✅ Aplicación completamente funcional
✅ Base de datos inicializada
✅ Scripts de inicio/parada
✅ Configuración personalizada (API Key)
✅ Documentación completa
✅ Sistema listo para usar

## 📦 Archivos Para Descargar

Todos los archivos están listos para descargar desde:
```
/mnt/user-data/outputs/installer/
```

Incluye:
- install.js
- package.json
- INSTALAR.bat
- VERIFICAR_REQUISITOS.bat
- README.md
- INSTRUCCIONES.txt
- EMPAQUETADO.md
- crear-paquete.bat
- RESUMEN.md (este archivo)

## 🚀 Próximos Pasos

1. Descargue todos los archivos de la carpeta installer
2. Siga las instrucciones en EMPAQUETADO.md para crear el paquete
3. Pruebe el paquete completo en un entorno limpio
4. Distribuya a sus usuarios

---

**Versión**: 1.0
**Fecha**: Noviembre 2025
**Autor**: Sistema de instalación generado por Claude para Carlos
