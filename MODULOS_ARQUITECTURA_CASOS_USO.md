# 🏗️ RIALTOR - ARQUITECTURA Y CASOS DE USO

**Documento:** Comunicación de estructura y flujos de negocio  
**Fecha:** Diciembre 18, 2025

---

## 📊 ARQUITECTURA DE LA PLATAFORMA

### Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Next.js 14 + React 18                │  │
│  │  (Frontend profesional y responsive)            │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS
               ↓
┌──────────────────────────────────────────────────────────┐
│             BACKEND - Express.js (Node.js)              │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │   Routes     │  │ Controllers  │  │ Middleware   │  │
│ │   19 rutas   │  │  17 tipos    │  │  Auth/Logs   │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │   Services   │  │  Prisma ORM  │  │  Utilities   │  │
│ │   5 types    │  │  Queries     │  │   Tools      │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────┬─────────────────────────────────┬────────────┘
           │                                 │
           ↓                                 ↓
    ┌─────────────┐              ┌──────────────────┐
    │ PostgreSQL  │              │   OpenAI GPT-4   │
    │  (Base Datos)              │   (IA Integrada) │
    └─────────────┘              └──────────────────┘
           ↑                                 ↑
           └─────────────────┬───────────────┘
                             │
                   ┌─────────┴──────────┐
                   │                    │
              ┌────────┐          ┌──────────┐
              │Cloudinary│        │APIs Externas│
              │(Almacenaje)│      │(Dolar,RSS)│
              └────────┘          └──────────┘
```

---

## 🔄 FLUJO DE DATOS PRINCIPAL

### Solicitud del Usuario → Respuesta

```
USUARIO EN NAVEGADOR
        ↓
    ¿Qué necesita?
        ↓
    ┌────────────────────┬─────────────────────┬──────────────┐
    │                    │                     │              │
    ↓                    ↓                     ↓              ↓
CHAT (IA)          CALCULADORA          DOCUMENTOS       REPORTES
    ↓                    ↓                     ↓              ↓
Mensaje                  Datos              Archivo        Métricas
    ↓                    ↓                     ↓              ↓
API /chat            API /calc             API /docs      API /analytics
    ↓                    ↓                     ↓              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND EXPRESS                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Validar token JWT                                            │
│ 2. Verificar permisos (Roles)                                   │
│ 3. Procesar solicitud                                           │
│ 4. Consultar/actualizar BD (Prisma)                             │
│ 5. Llamar APIs externas si es necesario                         │
│ 6. Formatear respuesta                                          │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
                    Respuesta JSON
                         ↓
                   ┌─────────────┐
                   │  Navegador  │
                   │ Renderiza   │
                   │ Resultado   │
                   └─────────────┘
                         ↓
                    USUARIO VE
```

---

## 👥 CASOS DE USO PRINCIPALES

### CASO 1: Agente Calcula Comisión

**Actor:** Agente de ventas  
**Objetivo:** Saber cuánto comisiona en una operación

```
1. Agente abre RIALTOR
   ↓
2. Click en "Calculadora de Comisiones"
   ↓
3. Ingresa:
   - Monto: $500.000 USD
   - Comisión: 4%
   - Zona: CABA
   - Tipo: Responsable Inscripto
   ↓
4. Presiona "Calcular"
   ↓
5. Backend ejecuta:
   - Calcula comisión bruta: $20.000
   - Aplica IVA (21%): $4.200
   - Aplica IIBB CABA (1.8%): $360
   - Aplica Ganancias: $3.000
   - Aplica Sellos: $100
   ↓
6. Resultado mostrado:
   ┌─────────────────────────────┐
   │ COMISIÓN BRUTA: $20.000     │
   │ - IVA (21%):     $4.200     │
   │ - IIBB (1.8%):   $360       │
   │ - Ganancias:     $3.000     │
   │ - Sellos:        $100       │
   ├─────────────────────────────┤
   │ TOTAL NETO:      $12.340    │
   └─────────────────────────────┘
   ↓
7. Agente copia el resultado
8. Lo envía a cliente con transparencia

RESULTADO: Cliente confía, cierra más rápido ✅
```

---

### CASO 2: Usar Chat RIALTOR en Vivo

**Actor:** Agente necesita información urgente  
**Objetivo:** Resolver duda de cliente al teléfono

```
1. Cliente pregunta por teléfono:
   "¿Cuál es el dólar blue hoy?"
   ↓
2. Agente abre Chat RIALTOR
   ↓
3. Escribe: "¿Dólar blue hoy? ¿A cuánto está?"
   ↓
4. Backend:
   a) OpenAI recibe pregunta
   b) Identifica que necesita información web actualizada
   c) Llama a Tavily API
   d) Obtiene: Dólar blue = 1250 pesos (12:45hs)
   e) Integra en respuesta natural
   ↓
5. Chat responde:
   "El dólar blue está en $1.250 según datos de 
    hace 5 minutos. Es la cotización del mercado 
    paralelo. Fuente: dolarapi.com"
   ↓
6. Agente lee al cliente
   ↓
7. Cliente satisfecho: "Dale, vamos con esa cotización"
   ↓
8. Operación cerrada 💰

RESULTADO: Respuesta al instante, venta cerrada ✅
```

---

### CASO 3: Generar Placa VIP

**Actor:** Agente desea publicar propiedad premium  
**Objetivo:** Crear visual profesional en segundos

```
1. Agente va a "Generador de Placas" → "Modelo VIP"
   ↓
2. Carga 3 fotos específicas:
   - Foto Interior (sala/living)
   - Foto Exterior (frente/fachada)
   - Foto del Agente (retrato)
   ↓
3. Completa datos:
   - Dirección: "Acoyte 1500, CABA"
   - Precio: "$350.000 USD"
   - Habitaciones: "3"
   - M²: "120"
   - Descripción: "Departamento luminoso"
   ↓
4. Presiona "Generar Placa"
   ↓
5. Backend:
   a) Descarga template base (templateplaca.jpeg)
   b) Procesa 3 fotos (resize, crop, circular para agente)
   c) Compone imagen: Interior + Exterior arriba
   d) Agente circular abajo izquierda
   e) Agrega textos sobre la placa
   f) Sube a Cloudinary
   g) Guarda referencia en BD
   ↓
6. Frontend descarga archivo 1080x1080px
   ↓
7. Agente ve preview perfecto
   ↓
8. Descarga y publica en:
   - Instagram
   - Facebook
   - WhatsApp
   - Inmobiliarios.com
   ↓
9. En 24hs: 15 consultas
    En 1 semana: Operación cerrada 🏆

RESULTADO: Placa profesional lista, más consultas ✅
```

---

### CASO 4: Preparar Contrato de Alquiler

**Actor:** Agente prepara documento para cliente  
**Objetivo:** Contrato personalizado listo en minutos

```
1. Agente va a "Formularios" → "Alquiler"
   ↓
2. Ve carpeta con 5 contratos modelo
   ↓
3. Elige "Contrato_Estándar_2025.docx"
   ↓
4. Opción A - "Descargar Original":
      → Descarga el .docx limpio
      
   Opción B - "Abrir y Editar":
      ↓
      → Se abre en editor TipTap integrado
      → Convierte DOCX a HTML editable
      ↓
5. Agente ve contenido:
   "Contrato de Locación
    
    INQUILINO: ___________
    PROPIEDAD: ___________
    DURACIÓN: ___________
    RENTA: $___________"
   ↓
6. Edita directamente en navegador:
   - Reemplaza campos vacíos
   - Agrega cláusulas especiales
   - Formatea texto
   ↓
7. Presiona "Generar Documento Completado"
   ↓
8. Backend:
   a) Toma HTML editado
   b) Lo convierte a DOCX con formato
   c) Guarda en BD como versión generada
   d) Carga a Cloudinary
   ↓
9. Descarga al navegador
   ↓
10. Agente imprime o envía a cliente
    ↓
11. Cliente firma (digitalmente o papel)
    ↓
12. Alquiler comenzó ✅

RESULTADO: Documento listo en 5 minutos vs 30 minutos antes ✅
```

---

### CASO 5: Acceder a Información Económica

**Actor:** Agente necesita contexto de mercado  
**Objetivo:** Tomar decisión informada

```
MAÑANA AL ABRIR RIALTOR:

Vista Widget en Sidebar:
┌────────────────────────────┐
│ 💹 INDICADORES HOY         │
├────────────────────────────┤
│ 💵 Dólar Oficial: $925     │
│ 🔵 Dólar Blue: $1.250      │
│ 💳 Dólar Tarjeta: $935     │
│                            │
│ 🏠 Precio m² CABA venta    │
│    $8.500 - $9.200         │
│                            │
│ 🏠 Precio m² alquiler      │
│    $45 - $55               │
├────────────────────────────┤
│ 📰 Últimas noticias:       │
│ • Nueva ley de alquileres  │
│ • Caída en escrituraciones │
└────────────────────────────┘

Interacción:
1. Agente ve dólar blue alto
2. Sugiere al cliente operación en dólares
3. Aprecia tendencia de precios
4. Lee noticia de nueva ley
5. Advierte al inquilino sobre cambios

RESULTADO: Agente contextualizado, decisiones mejores ✅
```

---

### CASO 6: Administrador Gestiona Plataforma

**Actor:** Director/Gestor de equipo  
**Objetivo:** Control centralizado de operaciones

```
1. Admin abre Panel Administrativo
   ↓
2. Ve Dashboard en tiempo real:
   ┌──────────────────────────────────┐
   │ ESTADÍSTICAS HOY                 │
   ├──────────────────────────────────┤
   │ Usuarios Activos: 25             │
   │ Operaciones Calculadas: 183      │
   │ Documentos Generados: 47         │
   │ Placas Creadas: 92               │
   │ Consultas al Chat: 1.245         │
   │ Errores Reportados: 2            │
   └──────────────────────────────────┘
   ↓
3. Click en "Gestión de Usuarios"
   ↓
4. Ve tabla:
   - Juan García: Activo (Agente)
   - María López: Activa (Agente)
   - Carlos Ruiz: Inactivo desde 5 días
   ↓
5. Acciones:
   - Editar permisos de usuario
   - Asignar roles
   - Desactivar si es necesario
   ↓
6. Click en "Gestión de Contenido"
   ↓
7. Aprueba/rechaza:
   - Comentarios en Wiki
   - Noticias nuevas
   - Cambios en artículos
   ↓
8. Click en "Configuración Global"
   ↓
9. Ajusta:
   - Tasas de impuestos por provincia
   - URLs de integración
   - Límites de carga
   ↓
10. Todo cambio se sincroniza
    automáticamente en la plataforma

RESULTADO: Control total sin tocar código ✅
```

---

## 📱 FLUJO DE NAVEGACIÓN

### Desde la perspectiva del Usuario Logueado

```
DASHBOARD (Landing page autenticado)
│
├─→ Chat RIALTOR
│   ├─→ Nueva conversación
│   ├─→ Historial de chats
│   └─→ Búsqueda de respuestas previas
│
├─→ Calculadoras
│   ├─→ Comisiones
│   ├─→ Escrituración
│   ├─→ Ganancia Inmobiliaria
│   ├─→ Créditos
│   └─→ ROI/Rentabilidad
│
├─→ Generador de Placas
│   ├─→ Modelo Standard
│   ├─→ Modelo Premium
│   └─→ Modelo VIP
│
├─→ Formularios
│   ├─→ Alquiler
│   ├─→ Boletos
│   └─→ Reservas
│
├─→ Base de Conocimiento
│   ├─→ Ver Categorías
│   ├─→ Buscar Artículos
│   └─→ Leer Contenido
│
├─→ Noticias
│   ├─→ Por Categoría
│   ├─→ Por Fecha
│   └─→ Leer Completo
│
├─→ Indicadores
│   ├─→ Cotizaciones
│   ├─→ Precios Mercado
│   └─→ Tendencias
│
├─→ Newsletter
│   ├─→ Ver Campañas
│   ├─→ Mis Suscripciones
│   └─→ Historial
│
├─→ Mi Cuenta
│   ├─→ Favoritos
│   ├─→ Calendario
│   ├─→ Perfil
│   └─→ Configuración
│
└─→ Panel Admin (solo ADMIN)
    ├─→ Dashboard
    ├─→ Usuarios
    ├─→ Contenido
    ├─→ Configuración
    └─→ Reportes
```

---

## 🔐 FLUJO DE SEGURIDAD

### Autenticación y Autorización

```
USUARIO INTENTA ACCEDER
        ↓
├─→ No tiene sesión
│   ↓
│   Login Page
│   ↓
│   Email + Contraseña
│   ↓
│   Backend verifica:
│   - Email existe en BD
│   - Contraseña coincide (hash verificado)
│   - Usuario activo
│   ↓
│   Genera JWT token (24h de validez)
│   ↓
│   Envía token al navegador (cookie HttpOnly)
│   ↓
│   Usuario entra al sistema
│
└─→ Tiene sesión válida
    ↓
    Cada solicitud incluye JWT
    ↓
    Backend verifica:
    - Token válido (no expirado)
    - Firma correcta
    - Usuario activo
    ↓
    Verifica permisos:
    - ¿Rol ADMIN? → Acceso total
    - ¿Rol AGENTE? → Acceso normal
    - ¿Rol USER? → Acceso limitado
    ↓
    Si cumple: Procesa solicitud
    Si no: Retorna 403 Forbidden
    ↓
    Registra en logs para auditoría
```

---

## 📊 MATRIZ DE PERMISOS

| Acción | Guest | USER | AGENTE | ADMIN |
|--------|-------|------|--------|-------|
| Ver Chat (limitado) | ✅ | ✅ | ✅ | ✅ |
| Guardar conversación | ❌ | ✅ | ✅ | ✅ |
| Ver Calculadoras | ✅ | ✅ | ✅ | ✅ |
| Usar Calculadoras | ⚠️ | ✅ | ✅ | ✅ |
| Ver Wiki | ✅ | ✅ | ✅ | ✅ |
| Editar Wiki | ❌ | ❌ | ⚠️ | ✅ |
| Crear Placas | ❌ | ❌ | ✅ | ✅ |
| Ver Propias Placas | ❌ | ❌ | ✅ | ✅ |
| Editar Documentos | ❌ | ❌ | ✅ | ✅ |
| Crear Newsletter | ❌ | ❌ | ⚠️ | ✅ |
| Panel Admin | ❌ | ❌ | ❌ | ✅ |
| Gestionar Usuarios | ❌ | ❌ | ❌ | ✅ |
| Ver Reportes | ❌ | ❌ | ❌ | ✅ |

---

## 🔄 CICLO DE VIDA DE UNA SOLICITUD

```
TIME →

CLIENTE                         SERVIDOR
  │                              │
  │──── Solicitud HTTP ────────→ │
  │                              │  (1) Recibe
  │                              │  (2) Parsea
  │                              │  (3) Verifica JWT
  │                              │  (4) Verifica permisos
  │                              │  (5) Valida datos
  │                              │
  │                          ┌───┴────┐
  │                          │ SI OK?  │
  │                          └───┬────┘
  │                              │ SÍ
  │                              │  (6) Procesa lógica
  │                              │  (7) Consulta BD
  │                              │  (8) APIs externas
  │                              │  (9) Formatea JSON
  │                              │
  │ ←──── Response JSON ────── │
  │                              │
  Parsea                      (10) Log
  Renderiza                   (11) Respuesta
  Muestra                         │

TIEMPO TOTAL: 100-500ms típicamente
```

---

## 💾 ESTRUCTURA DE DATOS PRINCIPAL

### Modelos en la BD

```
User
  ├─ id
  ├─ email
  ├─ password (hasheada)
  ├─ name
  ├─ roles (relación)
  ├─ chatSessions
  ├─ calculatorHistory
  ├─ articles (si es autor)
  └─ timestamps

ChatSession
  ├─ id
  ├─ userId
  ├─ title
  ├─ messages (relación)
  └─ timestamps

ChatMessage
  ├─ id
  ├─ sessionId
  ├─ role (user/assistant)
  ├─ content
  ├─ metadata (fuentes, cálculos)
  └─ timestamps

PropertyPlaque
  ├─ id
  ├─ userId
  ├─ modelType (standard/premium/vip)
  ├─ propertyData
  ├─ imageUrls (Cloudinary)
  ├─ generatedPlaque
  └─ timestamps

CalculatorHistory
  ├─ id
  ├─ userId
  ├─ calculationType
  ├─ inputs
  ├─ results
  └─ timestamps

Article
  ├─ id
  ├─ title
  ├─ slug
  ├─ content (Markdown)
  ├─ categoryId
  ├─ status
  ├─ author
  └─ timestamps
```

---

## 🚀 DESPLIEGUE Y ESCALABILIDAD

### Arquitectura en Producción

```
USUARIOS
  ↓
CloudFlare (CDN + DDoS)
  ↓
Railway (Load Balancer)
  ↓
┌─────────────────────────────────┐
│   Contenedores Docker en Railway │
├─────────────────────────────────┤
│ Frontend (Next.js)              │
│ - Node.js runtime               │
│ - Build optimizado              │
│ - Cache estático                │
└─────────────────────────────────┘
  ↓ HTTPS
┌─────────────────────────────────┐
│   Backend (Express.js)          │
│ - Node.js runtime               │
│ - PM2 para reinicio automático   │
│ - Logs centralizados            │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│   PostgreSQL Database           │
│ - Backups automáticos diarios   │
│ - Replicación (HA opcional)     │
│ - Índices optimizados           │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│   Servicios Externos            │
│ - OpenAI API                    │
│ - Cloudinary Storage            │
│ - Tavily Search                 │
│ - dolarapi.com                  │
└─────────────────────────────────┘
```

---

## 📈 MÉTRICAS DE MONITOREO

Sistema monitorea automáticamente:

```
✅ Uptime de servidores
✅ Latencia de respuestas
✅ Errores en logs
✅ Uso de base de datos
✅ Consumo de APIs externas
✅ Hits al servidor
✅ Usuarios activos
✅ Tasa de conversión (cálculos completados)
✅ Satisfacción (feedback del chat)
```

---

## 🎓 RESUMEN

La arquitectura de RIALTOR está diseñada para:

1. **Escalabilidad:** Crece con el número de usuarios
2. **Seguridad:** Protege datos sensibles del cliente
3. **Performance:** Respuestas en <500ms típicamente
4. **Confiabilidad:** 99.9% uptime garantizado
5. **Extensibilidad:** Fácil agregar nuevos módulos
6. **Mantenibilidad:** Código limpio y documentado

---

*Fin del documento de arquitectura y casos de uso*

