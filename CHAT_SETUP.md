# 🚀 Guía Rápida: Configurar el Chat Mejorado

## ⚡ Pasos Rápidos

### 1. Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` y agrega:

```bash
# REQUERIDO - Sin esto el chat no funcionará
OPENAI_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4o

# OPCIONAL - Mejora las respuestas con información en tiempo real
TAVILY_API_KEY=tvly-tu-api-key-aqui
```

### 2. Obtener API Keys

#### OpenAI (REQUERIDO)
1. Ir a: https://platform.openai.com/api-keys
2. Login o crear cuenta
3. Click "Create new secret key"
4. Copiar la key (empieza con `sk-`)
5. Pegarla en `.env` como `OPENAI_API_KEY`

#### Tavily (OPCIONAL pero RECOMENDADO)
1. Ir a: https://tavily.com
2. Click "Sign Up" (gratis - 1000 búsquedas/mes)
3. Verificar email
4. En el dashboard, copiar tu API key
5. Pegarla en `.env` como `TAVILY_API_KEY`

### 3. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 4. Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. ¡Probar!

1. Abre el navegador en `http://localhost:3000`
2. Haz login
3. Click en el botón del chat (esquina inferior derecha)
4. Prueba estas consultas:

```
💰 "¿Cuál es el precio del dólar blue hoy en Argentina?"
🧮 "Calcular honorarios para venta de $100.000 USD con comisión del 4% en CABA"
📋 "¿Cuáles son los gastos de escrituración en Buenos Aires?"
📈 "¿Cuáles son las tendencias del mercado inmobiliario en Palermo?"
```

---

## 🎯 Ejemplos de Uso

### Búsqueda en Tiempo Real
```
Usuario: "¿Cuál es el precio del dólar blue hoy?"
RIALTOR: [Busca en internet y responde con datos actuales + fuentes]
```

### Cálculos Automáticos
```
Usuario: "Calcular honorarios para $120.000 USD, 4% comisión, CABA"
RIALTOR: [Muestra cálculo detallado con IVA, IIBB, Ganancias, etc.]
```

### Asesoramiento
```
Usuario: "¿Qué documentos necesito para escriturar?"
RIALTOR: [Respuesta detallada con checklist]
```

---

## ⚠️ Troubleshooting

### "Lo siento, el servicio de IA no está disponible"
- ✅ Verificar que `OPENAI_API_KEY` esté en `.env`
- ✅ Verificar que la key sea válida
- ✅ Reiniciar el servidor backend

### El chat no busca información en internet
- ℹ️ Esto es normal si no configuraste `TAVILY_API_KEY`
- ✅ Para habilitar búsqueda web, agrega la key de Tavily
- ⚠️ Sin Tavily, el chat sigue funcionando pero sin datos en tiempo real

### Error de compilación en frontend
```bash
cd frontend
rm -rf .next
npm run dev
```

---

## 💡 Tips

1. **GPT-4o es más caro** pero mucho mejor que GPT-3.5
   - Recomendado para producción
   - Usar GPT-3.5 solo para desarrollo/testing

2. **Monitorea costos** en: https://platform.openai.com/usage
   - Cada mensaje consume tokens
   - Function calling usa más tokens

3. **Tavily gratis** tiene límite de 1000 búsquedas/mes
   - Suficiente para la mayoría de casos
   - Plan pago si necesitas más

4. **Mejora continua**
   - El asistente aprende de conversaciones
   - Puedes ajustar el prompt del sistema en `chatController.js`

---

## 📚 Documentación Completa

Ver: `CHAT_IMPROVEMENTS.md` para detalles técnicos completos

---

**¡Todo listo! Tu asistente inmobiliario está configurado** 🎉
