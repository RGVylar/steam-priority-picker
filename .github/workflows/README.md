# GitHub Actions Workflows - Guía de Uso

Este documento explica cómo funcionan y cómo ver los GitHub Actions configurados en este repositorio.

## 📋 Workflows Disponibles

### Keep Backend Alive (`keep-alive.yml`)

**Propósito:** Mantener el backend activo haciendo ping periódico al endpoint `/health`.

**Características:**
- ⏰ **Ejecución automática**: Cada 5 minutos mediante cron schedule
- 🔄 **Ejecución manual**: Disponible mediante workflow_dispatch
- 🛡️ **Tolerante a fallos**: Usa `continue-on-error: true` para no fallar el workflow si el backend no responde

**Configuración requerida:**
- `BACKEND_URL`: Secret que debe configurarse en GitHub con la URL del backend (ej: `https://tu-backend.onrender.com`)

## 🔍 Cómo Ver las Ejecuciones del Action

### Opción 1: Desde la interfaz web de GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/RGVylar/steam-priority-picker`
2. Haz clic en la pestaña **"Actions"** en la parte superior
3. En el panel izquierdo, verás la lista de workflows. Haz clic en **"Keep Backend Alive"**
4. Aquí verás:
   - ✅ **Ejecuciones exitosas** (verde)
   - ❌ **Ejecuciones fallidas** (rojo)
   - 🔄 **Ejecuciones en progreso** (amarillo)
5. Haz clic en cualquier ejecución para ver los detalles y logs

**URL directa**: `https://github.com/RGVylar/steam-priority-picker/actions/workflows/keep-alive.yml`

### Opción 2: Ejecutar manualmente el workflow

1. Ve a la pestaña **Actions**
2. Selecciona el workflow **"Keep Backend Alive"**
3. Haz clic en el botón **"Run workflow"** (esquina superior derecha)
4. Selecciona la rama (normalmente `main`)
5. Haz clic en **"Run workflow"** verde
6. En unos segundos aparecerá la nueva ejecución

### Opción 3: Usando GitHub CLI (`gh`)

```bash
# Ver las últimas ejecuciones
gh run list --workflow=keep-alive.yml

# Ver los detalles de una ejecución específica
gh run view <run-id>

# Ver los logs de una ejecución
gh run view <run-id> --log

# Ejecutar manualmente el workflow
gh workflow run keep-alive.yml
```

## ⚙️ Configurar el Secret BACKEND_URL

Para que el workflow funcione correctamente, necesitas configurar el secret `BACKEND_URL`:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Haz clic en **"New repository secret"**
3. Nombre: `BACKEND_URL`
4. Valor: La URL de tu backend (ej: `https://steam-priority-picker-backend.onrender.com`)
5. Haz clic en **"Add secret"**

## 🧪 Verificar que el Workflow Funciona

### Método 1: Ejecución manual
1. Ejecuta el workflow manualmente como se explicó arriba
2. Ve a la página de ejecución
3. Haz clic en el job **"ping"**
4. Revisa los logs del paso **"Ping backend"**
5. Deberías ver algo como:
   ```
   {"status":"ok","service":"Steam Priority Picker API","version":"0.1.0"}
   ```

### Método 2: Verificar ejecuciones automáticas
1. Espera 5 minutos después de hacer push al repositorio
2. Ve a Actions y verifica que hay una nueva ejecución
3. Revisa que sea exitosa (marca verde ✅)

## 🐛 Problemas Comunes

### El workflow no aparece en Actions
- **Causa**: El archivo debe estar en la rama `main` o la rama por defecto
- **Solución**: Haz push del workflow a la rama principal

### "Secret BACKEND_URL not set"
- **Causa**: El secret no está configurado
- **Solución**: Configura el secret como se explicó arriba

### El curl falla pero no hay error
- **Causa**: El workflow usa `continue-on-error: true`
- **Solución**: Revisa los logs para ver el mensaje de error específico

### El cron no ejecuta el workflow
- **Causa**: GitHub Actions puede tener retrasos en cron schedules
- **Solución**: Los schedules pueden tardar hasta 15-30 minutos en ejecutarse. Usa `workflow_dispatch` para pruebas inmediatas

## 📊 Interpretando los Resultados

### Respuesta exitosa del backend:
```json
{
  "status": "ok",
  "service": "Steam Priority Picker API",
  "version": "0.1.0"
}
```

### Posibles códigos de respuesta:
- **200 OK**: Backend funcionando correctamente ✅
- **404 Not Found**: Endpoint no existe ❌
- **500 Internal Server Error**: Error en el backend ❌
- **Connection refused**: Backend no está corriendo ❌

## 🔧 Modificar el Workflow

Si necesitas cambiar la frecuencia de ejecución, edita el cron schedule:

```yaml
schedule:
  # Cada 5 minutos
  - cron: '*/5 * * * *'
  
  # Cada 10 minutos
  - cron: '*/10 * * * *'
  
  # Cada hora
  - cron: '0 * * * *'
  
  # Cada día a las 9:00 AM UTC
  - cron: '0 9 * * *'
```

**Nota**: GitHub Actions puede tener hasta 15 minutos de retraso en schedules durante períodos de alta carga.

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Cron Schedule Syntax](https://crontab.guru/)
