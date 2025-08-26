# 🤖 Asistente Flotante RIALTOR

## Descripción

Asistente de IA flotante integrado con excelente UI/UX que aparece en todas las vistas del proyecto. Utiliza la integración existente con OpenAI y almacena todas las conversaciones en la base de datos.

## ✨ Características

### 🎨 UI/UX de Alto Nivel
- **Botón flotante elegante** con efectos de pulse y sparkles
- **Animaciones suaves** con Framer Motion
- **Diseño responsive** y professional
- **Gradientes modernos** y sombras sutiles
- **Tooltip informativo** al hacer hover

### 💬 Chat Inteligente
- **Integración completa con OpenAI** usando tu API existente
- **Persistencia en base de datos** usando las tablas ChatSession y ChatMessage
- **Sugerencias rápidas** para consultas comunes
- **Indicador de escritura** animado
- **Auto-scroll** al último mensaje

### 🔧 Funcionalidades Avanzadas
- **Minimizar/Maximizar** el chat
- **Limpiar conversación** con un click
- **Feedback de mensajes** (👍/👎)
- **Copiar respuestas** al clipboard
- **Notificaciones** de estado
- **Scroll personalizado** con barras elegantes

### 🎯 Integración Perfecta
- **Context Providers** para estado global
- **Hooks personalizados** para lógica reutilizable
- **API endpoints** para feedback
- **Estilos CSS** optimizados
- **TypeScript** para type safety

## 📁 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── FloatingAssistant.tsx      # Componente principal del asistente
│   ├── MessageActions.tsx         # Acciones de mensajes (copiar, feedback)
│   └── Notification.tsx           # Sistema de notificaciones
├── contexts/
│   ├── AssistantContext.tsx       # Estado global del asistente
│   └── NotificationContext.tsx    # Sistema de notificaciones
├── hooks/
│   ├── useAssistantChat.ts        # Lógica del chat
│   └── useNotifications.ts        # Manejo de notificaciones
├── pages/api/chat/
│   └── feedback.ts                # Endpoint para feedback
└── styles/
    └── globals.css                # Estilos personalizados
```

## 🚀 Instalación y Uso

### 1. Dependencias ya instaladas
El proyecto ya tiene todas las dependencias necesarias:
- `framer-motion` para animaciones
- `lucide-react` para iconos
- `tailwindcss` para estilos

### 2. Configuración automática
El asistente se configura automáticamente al estar incluido en el layout principal:

```tsx
// app/layout.tsx
<AuthProvider>
  <NotificationProvider>
    <AssistantProvider>
      <FloatingAssistant />
    </AssistantProvider>
  </NotificationProvider>
</AuthProvider>
```

### 3. Backend endpoint
Se agregó el endpoint de feedback en el backend:

```javascript
// backend/routes/chat.js
router.post('/feedback', chatController.sendFeedback);
```

## 💡 Cómo usar

### Para usuarios finales:
1. **Abrir chat**: Click en el botón flotante rojo (bottom-right)
2. **Escribir consulta**: Usar el input o sugerencias rápidas
3. **Enviar mensaje**: Enter o click en botón send
4. **Dar feedback**: Usar 👍/👎 en respuestas del asistente
5. **Copiar respuesta**: Click en icono de copiar
6. **Minimizar**: Click en icono minimizar para reducir espacio
7. **Limpiar chat**: Click en icono refresh para nueva conversación

### Para desarrolladores:
```tsx
// Usar el context del asistente
import { useAssistant } from '../contexts/AssistantContext'

function MyComponent() {
  const { openAssistant, closeAssistant } = useAssistant()
  
  return (
    <button onClick={openAssistant}>
      Abrir Asistente
    </button>
  )
}
```

```tsx
// Mostrar notificaciones
import { useNotificationContext } from '../contexts/NotificationContext'

function MyComponent() {
  const { showSuccess, showError } = useNotificationContext()
  
  const handleAction = () => {
    showSuccess('¡Acción completada!')
  }
}
```

## 🎨 Personalización

### Colores y estilos
Los colores principales se pueden modificar en `globals.css`:

```css
.assistant-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

### Sugerencias rápidas
Modificar en `FloatingAssistant.tsx`:

```tsx
const suggestions = [
  { icon: '💰', text: 'Calcular honorarios', action: '...' },
  { icon: '📋', text: 'Gastos escritura', action: '...' },
  // Agregar más sugerencias
]
```

### Posicionamiento
Cambiar posición del botón flotante:

```tsx
// Cambiar clases CSS
className="fixed bottom-6 right-6 z-50"  // Actual
className="fixed bottom-6 left-6 z-50"   // Izquierda
className="fixed top-6 right-6 z-50"     // Top derecha
```

## 🔌 API Integration

### Endpoint existente
Usa tu endpoint existente `/api/chat` que ya tiene:
- ✅ Integración con OpenAI
- ✅ Almacenamiento en DB
- ✅ Manejo de sesiones
- ✅ Herramientas internas (tasador, calculadoras)

### Nuevo endpoint de feedback
```typescript
// POST /api/chat/feedback
{
  messageId: string,
  feedbackType: 'positive' | 'negative',
  sessionId: string
}
```

## 📊 Base de Datos

### Tablas utilizadas
- `ChatSession`: Sesiones de chat por usuario
- `ChatMessage`: Mensajes individuales con metadata
- El feedback se almacena en el campo `metadata` de `ChatMessage`

### Estructura del feedback
```json
{
  "model": "hybrid-rialtor",
  "source": "internal",
  "feedback": "positive",
  "feedbackAt": "2025-08-26T..."
}
```

## 🔧 Troubleshooting

### Problemas comunes:

1. **El asistente no aparece**
   - Verificar que esté incluido en el layout
   - Revisar errores en console

2. **Errores de API**
   - Verificar variables de entorno
   - Revisar backend corriendo

3. **Animaciones lentas**
   - Verificar rendimiento del dispositivo
   - Reducir animaciones si necesario

4. **Estilos rotos**
   - Verificar que Tailwind CSS esté configurado
   - Revisar imports de CSS

## 🚀 Próximas mejoras

### Features planeadas:
- [ ] **Historial de conversaciones** persistente
- [ ] **Búsqueda en conversaciones** anteriores
- [ ] **Comandos rápidos** con slash (/)
- [ ] **Modo offline** con respuestas cached
- [ ] **Temas personalizables** (claro/oscuro)
- [ ] **Atajos de teclado** para abrir/cerrar
- [ ] **Integración con notificaciones** del navegador
- [ ] **Exportar conversaciones** a PDF/TXT

### Optimizaciones técnicas:
- [ ] **Lazy loading** de mensajes antiguos
- [ ] **Debounce** en el input
- [ ] **Virtual scrolling** para conversaciones largas
- [ ] **Service Worker** para cache
- [ ] **PWA features** para móviles

---

## 🎉 ¡Listo para usar!

El asistente flotante está completamente integrado y listo para usar en producción. Proporciona una experiencia de usuario excepcional con diseño profesional y funcionalidades avanzadas.

**¡Tu asistente de IA inmobiliario está listo para ayudar a tus usuarios! 🏠🤖**
