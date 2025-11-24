# Guía para Probar la PWA en Android

## ✅ Cambios Realizados

### 1. Manifest.json Mejorado
- ✅ Íconos reordenados (192x192 y 512x512 primero)
- ✅ Agregado `purpose: "any maskable"` para mejor compatibilidad con Android
- ✅ Eliminado ícono .ico innecesario de la lista principal

### 2. Meta Tags Agregados en Layout
- ✅ `<link rel="manifest" href="/manifest.json" />`
- ✅ Meta tags de theme-color, mobile-web-app-capable
- ✅ Apple touch icon para iOS
- ✅ Ícono de 192x192 como favicon principal

### 3. Service Worker Mejorado
- ✅ Estrategia Network First (mejor para apps dinámicas)
- ✅ Mejor logging para debugging
- ✅ Manejo de errores mejorado
- ✅ Actualización automática del cache

### 4. Headers HTTP Configurados
- ✅ Content-Type correcto para manifest.json
- ✅ Service-Worker-Allowed configurado
- ✅ Cache-Control optimizado

### 5. Componente PWAInstall con Debugging
- ✅ Logs detallados para troubleshooting
- ✅ Detección de instalación existente
- ✅ Mejor manejo de eventos

## 🔍 Cómo Probar en Android

### Paso 1: Desplegar los Cambios
```bash
cd /home/hernan/proyectos/rialtor
git add .
git commit -m "fix: mejoras PWA para Android"
git push origin main
```

### Paso 2: Limpiar Caché en Android
1. Abre Chrome en Android
2. Ve a `chrome://serviceworker-internals/`
3. Busca `rialtor.app` y haz clic en "Unregister"
4. Ve a Configuración → Aplicaciones → Chrome → Almacenamiento
5. Limpia el caché y datos del sitio

### Paso 3: Visitar el Sitio
1. Abre Chrome en Android
2. Ve a `https://www.rialtor.app`
3. Abre DevTools (si tienes USB debugging):
   - Conecta el teléfono por USB
   - En Chrome desktop: `chrome://inspect#devices`
   - Inspecciona la página
   - Ve a Console y busca los logs del Service Worker

### Paso 4: Verificar Requisitos PWA
Abre Chrome en Android y ve a:
```
chrome://flags
```
Asegúrate de que estos flags estén habilitados:
- `#enable-web-app-install-ambient-badge` → Enabled
- `#enable-pwa-default-offline-page` → Enabled

### Paso 5: Interactuar con el Sitio
Para que Chrome muestre el prompt de instalación, debes:
1. ✅ Navegar al sitio (esperar que cargue completamente)
2. ✅ Hacer scroll por la página
3. ✅ Interactuar con algún elemento (click en un botón)
4. ✅ Esperar al menos 30 segundos en el sitio

## 🐛 Debugging en Android

### Ver Logs del Service Worker
1. Conecta el dispositivo Android por USB
2. Habilita "Depuración USB" en opciones de desarrollador
3. En Chrome desktop: `chrome://inspect#devices`
4. Inspecciona la página
5. Ve a la pestaña "Console"
6. Busca estos mensajes:
   - `✅ Service Worker registered successfully`
   - `✅ beforeinstallprompt event fired`
   - `📱 Mobile device detected`

### Verificar el Manifest
En DevTools móvil:
1. Ve a "Application" tab
2. Selecciona "Manifest" en el sidebar izquierdo
3. Verifica que muestre:
   - ✅ Name: "RIALTOR - Plataforma Inmobiliaria IA"
   - ✅ Short name: "RIALTOR"
   - ✅ Start URL: "/"
   - ✅ Icons: 192x192 y 512x512

### Verificar el Service Worker
En DevTools móvil:
1. Ve a "Application" tab
2. Selecciona "Service Workers" en el sidebar izquierdo
3. Verifica que el estado sea: "activated and is running"

## ⚠️ Razones Comunes por las que no Aparece el Prompt

### 1. El sitio NO está servido por HTTPS
- ✅ Rialtor.app ya usa HTTPS

### 2. El manifest.json tiene errores
- ✅ Verificado y corregido

### 3. Faltan íconos requeridos
- ✅ Íconos 192x192 y 512x512 agregados

### 4. El Service Worker no está registrado
- ✅ Verificado con logs de debugging

### 5. No has interactuado suficiente con el sitio
- ⚠️ **SOLUCIÓN**: Navega, haz scroll, espera 30 segundos

### 6. Ya instalaste la PWA antes
- ⚠️ **SOLUCIÓN**: Desinstala y limpia caché

### 7. Chrome tiene la función deshabilitada
- ⚠️ **SOLUCIÓN**: Revisa chrome://flags

## 📱 Instalación Manual (Plan B)

Si el prompt automático no aparece, los usuarios pueden instalar manualmente:

1. Abre el menú de Chrome (⋮)
2. Busca "Agregar a pantalla de inicio" o "Instalar aplicación"
3. Si no aparece, verifica que se cumplan todos los requisitos PWA

## 🔄 Forzar Actualización del Service Worker

Si hiciste cambios y no se reflejan:

```javascript
// En la consola del navegador:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister()
  }
})
location.reload()
```

## 📊 Verificar Score PWA

Usa Lighthouse para verificar:
1. Abre Chrome DevTools
2. Ve a "Lighthouse" tab
3. Selecciona "Progressive Web App"
4. Haz clic en "Generate report"
5. Verifica que el score sea > 90

## 🎯 Checklist Final

- [ ] Deploy realizado
- [ ] Caché limpiado en dispositivo Android
- [ ] HTTPS funcionando (www.rialtor.app)
- [ ] Service Worker registrado (verificar en DevTools)
- [ ] Manifest.json válido (verificar en DevTools)
- [ ] Íconos 192x192 y 512x512 existentes
- [ ] Navegaste e interactuaste con el sitio
- [ ] Esperaste al menos 30 segundos
- [ ] Verificaste chrome://flags

## 💡 Notas Importantes

1. **El prompt de instalación es controlado por Chrome**, no por nosotros. Chrome decide cuándo mostrarlo basándose en:
   - Engagement del usuario con el sitio
   - Historial de visitas
   - Frecuencia de uso

2. **Nuestro banner personalizado** (`<PWAInstall />`) se mostrará cuando Chrome dispare el evento `beforeinstallprompt`.

3. **Si todo está correcto pero no aparece**, es porque Chrome aún no considera que el usuario esté suficientemente comprometido con el sitio.

## 🔗 Links Útiles

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
