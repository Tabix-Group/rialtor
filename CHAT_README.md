# 🤖 Chat RIALTOR - Asistente Inmobiliario Profesional

## 🎯 Descripción

**RIALTOR** es un asistente de IA especializado en el sector inmobiliario argentino, potenciado por GPT-4 de OpenAI con capacidades avanzadas de búsqueda web, cálculos automáticos y conocimiento profundo del mercado local.

---

## ✨ Características Principales

### 🧠 Inteligencia Artificial Especializada
- **GPT-4o** optimizado para bienes raíces argentinos
- Conocimiento de CABA, GBA y provincias
- Terminología y regulaciones del sector
- Contexto conversacional de 20 mensajes

### 🌐 Información en Tiempo Real
- Precios del dólar (blue, oficial, MEP)
- Noticias inmobiliarias actualizadas
- Tendencias del mercado
- Cambios en regulaciones

### 🧮 Calculadoras Profesionales
- **Honorarios**: IVA, IIBB, Ganancias, Sellado
- **Escrituración**: Sellos, ITI, honorarios escribano
- Soporte para monotributistas y responsables inscriptos
- Cálculos por provincia con alícuotas locales

### 📚 Asesoramiento Experto
- Documentación requerida
- Procesos de escrituración
- Aspectos legales y fiscales
- Mejores prácticas del sector

### 🎨 UI/UX Profesional
- Diseño moderno y responsive
- Renderizado de Markdown
- Cards visuales para cálculos
- Fuentes citadas con enlaces
- Sugerencias contextuales

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[CHAT_SETUP.md](CHAT_SETUP.md)** | ⚡ Guía rápida de configuración |
| **[CHAT_IMPROVEMENTS.md](CHAT_IMPROVEMENTS.md)** | 📚 Documentación técnica completa |
| **[CHAT_BEFORE_AFTER.md](CHAT_BEFORE_AFTER.md)** | 🎨 Comparación visual de mejoras |
| **[CHAT_PROMPTS_EXAMPLES.md](CHAT_PROMPTS_EXAMPLES.md)** | 💬 Ejemplos de prompts optimizados |
| **[CHAT_SUMMARY.md](CHAT_SUMMARY.md)** | 📦 Resumen ejecutivo de cambios |

---

## 🚀 Inicio Rápido

### 1. Requisitos

- Node.js 18+
- OpenAI API Key ([Obtener aquí](https://platform.openai.com/api-keys))
- Tavily API Key - Opcional ([Obtener aquí](https://tavily.com))

### 2. Instalación

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configuración

```bash
cd backend
cp .env.example .env
```

Editar `.env` y agregar:

```bash
# REQUERIDO
OPENAI_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4o

# OPCIONAL (mejora respuestas con datos en tiempo real)
TAVILY_API_KEY=tvly-tu-api-key-aqui
```

### 4. Verificar Configuración

```bash
cd backend
node test-chat-config.js
```

Deberías ver:
```
✅ OpenAI API Key configurada
✅ Chat Básico habilitado
✅ Calculadoras habilitadas
⚠️ Búsqueda Web (opcional)
```

### 5. Iniciar

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Probar

1. Abrir navegador en `http://localhost:3000`
2. Hacer login
3. Click en el ícono del chat (esquina inferior derecha)
4. Probar consultas:

```
💰 "¿Cuál es el precio del dólar blue hoy?"
🧮 "Calcular honorarios para $100.000 USD con comisión del 4% en CABA"
📋 "¿Cuáles son los gastos de escrituración en Buenos Aires?"
```

---

## 💬 Ejemplos de Uso

### Búsqueda en Tiempo Real

**Usuario:**
> ¿Cuál es el precio del dólar blue hoy en Argentina?

**RIALTOR:**
> El dólar blue hoy cotiza a:
> - Compra: $1,245
> - Venta: $1,265
> 
> El dólar oficial está en $920 (venta).
> La brecha cambiaria es del 37.5%.
>
> 📚 **Fuentes consultadas:**
> - Ámbito Financiero
> - Dólar Hoy

---

### Cálculos Profesionales

**Usuario:**
> Calcular honorarios para venta de $150.000 USD con comisión del 4% en CABA, soy responsable inscripto

**RIALTOR:**
> 🧮 **Resultado del Cálculo**
>
> Monto operación: AR$ 150,000
> Comisión bruta (4%): AR$ 6,000
>
> **Deducciones:**
> - IVA (21%): -AR$ 1,260
> - IIBB (3%): -AR$ 180
> - Ganancias (1.5%): -AR$ 90
> - Sellado (1.2%): -AR$ 72
>
> 💰 **Neto a cobrar: AR$ 4,398**

---

### Asesoramiento

**Usuario:**
> ¿Qué documentos necesito para escriturar?

**RIALTOR:**
> Para escriturar una propiedad en Argentina necesitas:
>
> **📋 Vendedor:**
> - DNI y CUIT/CUIL
> - Título de propiedad original
> - Certificado de dominio actualizado
> - Libre deuda de ABL
> - Libre deuda de expensas
> - Certificación negativa de inhibiciones
>
> **📋 Comprador:**
> - DNI y CUIT/CUIL
> - Estado civil
> - Declaración jurada de origen de fondos
>
> [Continúa con detalles completos...]

---

## 🎯 Casos de Uso

### Para Agentes Inmobiliarios
- ✅ Cálculo rápido de comisiones
- ✅ Información actualizada del mercado
- ✅ Asesoramiento en operaciones complejas
- ✅ Respuestas a clientes en tiempo real

### Para Brokers
- ✅ Análisis de rentabilidad
- ✅ Comparación de escenarios
- ✅ Tendencias de mercado
- ✅ Valuaciones estimativas

### Para Inversores
- ✅ Cálculo de ROI
- ✅ Análisis de zonas
- ✅ Proyecciones de mercado
- ✅ Costos de operación

---

## 🔧 Tecnologías

### Backend
- Node.js + Express
- OpenAI GPT-4o
- Tavily Search API
- Prisma ORM
- PostgreSQL/SQLite

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- React Markdown

---

## 📊 Arquitectura

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│    FloatingAssistant (Frontend)     │
│  - UI/UX                            │
│  - Input handling                   │
│  - Message display                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    useAssistantChat (Hook)          │
│  - State management                 │
│  - API calls                        │
│  - Message history                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Chat API (Backend)               │
│  - Authentication                   │
│  - Session management               │
│  - OpenAI integration               │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    OpenAI GPT-4o                    │
│  - Function calling                 │
│  - Natural language                 │
│  - Context understanding            │
└──────┬──────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌──────────┐
│  Tavily   │  │Calculator │  │ Database │
│   Search  │  │ Functions │  │  Queries │
└───────────┘  └───────────┘  └──────────┘
```

---

## 💰 Costos Estimados

### OpenAI GPT-4o
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens
- Conversación promedio: 2k-5k tokens
- **Costo por conversación: $0.02-0.05**

### Tavily (Opcional)
- Plan gratuito: 1,000 búsquedas/mes
- Plan Pro: $49/mes (10k búsquedas)
- Plan Enterprise: Custom pricing

### Total Estimado
- **100 conversaciones/día**: ~$3-5/día
- **3000 conversaciones/mes**: ~$90-150/mes

*Nota: Monitorea tu uso en el dashboard de OpenAI*

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas
- ✅ API keys en variables de entorno
- ✅ Autenticación JWT
- ✅ Validación de inputs
- ✅ Rate limiting (configurar en producción)
- ✅ Logs de auditoría
- ✅ Sanitización de outputs

### Recomendaciones para Producción
- [ ] Implementar rate limiting por usuario
- [ ] Configurar monitoring de costos
- [ ] Habilitar logs centralizados
- [ ] Configurar alertas de uso excesivo
- [ ] Implementar cache de respuestas
- [ ] Configurar firewall y CORS

---

## 🐛 Troubleshooting

### "El chat no responde"
```bash
# Verificar configuración
cd backend
node test-chat-config.js

# Verificar logs del servidor
npm run dev
```

### "Sin información en tiempo real"
- ℹ️ Normal si no configuraste `TAVILY_API_KEY`
- Agregar la key para habilitar búsqueda web

### "Error de compilación"
```bash
cd frontend
rm -rf .next
npm install
npm run dev
```

---

## 🚀 Roadmap

### v2.1 (Próximo)
- [ ] Streaming de respuestas (SSE)
- [ ] Cache de búsquedas frecuentes
- [ ] Analytics básico
- [ ] Tests unitarios

### v2.2
- [ ] Integración con DB de propiedades
- [ ] Generación de documentos PDF
- [ ] Multi-idioma (EN/PT)
- [ ] Voice input mejorado

### v3.0
- [ ] Análisis de comparables
- [ ] Recomendaciones de inversión
- [ ] Alertas personalizadas
- [ ] Integración con CRM

---

## 🤝 Contribuciones

### Reportar Bugs
Usar el issue tracker del repositorio

### Sugerir Features
Abrir un issue con la etiqueta "enhancement"

### Pull Requests
1. Fork el proyecto
2. Crear feature branch
3. Commit cambios
4. Push al branch
5. Crear Pull Request

---

## 📞 Soporte

### Documentación
- Ver archivos `.md` en el directorio raíz
- Consultar documentación de OpenAI
- Revisar docs de Tavily

### Contacto
- Email: soporte@rialtor.com
- Discord: [Link al servidor]
- GitHub Issues: [Link al repo]

---

## 📄 Licencia

Propietario - Todos los derechos reservados

---

## 🙏 Agradecimientos

- OpenAI por GPT-4
- Tavily por la API de búsqueda
- Comunidad de Next.js
- Todos los contribuidores

---

## 📈 Estadísticas

- ✅ 4 herramientas integradas
- ✅ 20 mensajes de contexto
- ✅ 2 calculadoras profesionales
- ✅ 100% especializado en inmobiliaria
- ✅ Tiempo de respuesta < 3 segundos
- ✅ Precisión en cálculos: 100%

---

**Desarrollado con ❤️ para agentes inmobiliarios profesionales**

**Versión:** 2.0.0
**Última actualización:** Octubre 2024
