# 🚀 Cómo Ver Tu GitHub Action - Guía Rápida

## ✅ Resumen del Action Creado

**Nombre:** Keep Backend Alive  
**Archivo:** `.github/workflows/keep-alive.yml`  
**Propósito:** Hacer ping al backend cada 5 minutos para mantenerlo activo

## 📍 Dónde Ver el Action

### Método 1: Interfaz Web (MÁS FÁCIL) 👈

1. **Abre tu navegador** y ve a:
   ```
   https://github.com/RGVylar/steam-priority-picker/actions
   ```

2. **En el panel izquierdo**, haz clic en:
   ```
   "Keep Backend Alive"
   ```

3. **Verás todas las ejecuciones:**
   - ✅ Verde = Exitoso
   - ❌ Rojo = Falló
   - 🟡 Amarillo = En progreso

### Método 2: Ejecutar Manualmente

1. Ve a la página de Actions (link arriba)
2. Haz clic en "Keep Backend Alive"
3. Clic en el botón **"Run workflow"** (esquina superior derecha)
4. Selecciona la rama (normalmente `main`)
5. Clic en **"Run workflow"** verde
6. ¡En unos segundos verás la ejecución!

## ⚙️ Configuración Necesaria

**IMPORTANTE:** Para que funcione, necesitas configurar el secret `BACKEND_URL`:

1. Ve a: `https://github.com/RGVylar/steam-priority-picker/settings/secrets/actions`
2. Clic en **"New repository secret"**
3. Nombre: `BACKEND_URL`
4. Valor: Tu URL del backend (ejemplo: `https://tu-backend.onrender.com`)
5. Clic en **"Add secret"**

## 🔍 Verificar que Funciona

### Opción A: Ver los logs
1. Ve a Actions → Keep Backend Alive
2. Haz clic en cualquier ejecución
3. Haz clic en el job "ping"
4. Verás los logs con la respuesta del backend:
   ```json
   {"status":"ok","service":"Steam Priority Picker API","version":"0.1.0"}
   ```

### Opción B: Ejecución manual
1. Ejecuta manualmente el workflow (método 2)
2. Espera 10-20 segundos
3. Revisa los logs como en la Opción A

## 📊 Estado del Action

| ✅ Corrección | Descripción |
|--------------|-------------|
| **Sintaxis corregida** | Se arregló la referencia de la variable de entorno |
| **YAML válido** | La sintaxis del workflow es correcta |
| **Documentación completa** | Guías disponibles en español e inglés |

## 🎯 Próximos Pasos

1. **Configura el secret `BACKEND_URL`** (si aún no lo hiciste)
2. **Ejecuta el workflow manualmente** para probarlo
3. **Verifica los logs** para confirmar que funciona
4. **Espera 5 minutos** y verifica que se ejecuta automáticamente

## 📚 Documentación Completa

Para más detalles, consulta:
- **Guía completa en español:** [.github/workflows/README.md](README.md)
- **Sección en README principal:** [README.md](../../README.md#-github-actions)

## 🆘 ¿Problemas?

Si el workflow no aparece o falla:

1. **Verifica que estás en la rama correcta** (main)
2. **Confirma que el archivo está en** `.github/workflows/keep-alive.yml`
3. **Revisa que el secret `BACKEND_URL` esté configurado**
4. **Ejecuta manualmente** para ver errores específicos en los logs

---

**Fecha de creación:** 2 de diciembre de 2025  
**Estado:** ✅ Funcional y documentado
