# 📋 RIALTOR - MATRIZ DE FUNCIONALIDADES Y ACCESO

**Documento:** Guía de referencia rápida para comunicación  
**Fecha:** Diciembre 18, 2025

---

## 🎯 ACCESO RÁPIDO POR PERFIL

### 👤 Usuario GUEST (No autenticado)
**Permisos:** Solo lectura de contenido público

| Módulo | Acceso | Detalles |
|--------|--------|----------|
| Landing Page | ✅ Completo | Ver features y descripción |
| Chat RIALTOR | ⚠️ Limitado | Máx 3 mensajes sin guardar |
| Calculadoras | ⚠️ Limitado | Ver resultados, sin guardar historial |
| Generador Placas | ❌ No | Debe crear cuenta |
| Base de Conocimiento | ✅ Lectura | Ver artículos publicados |
| Noticias | ✅ Lectura | Ver últimas noticias |
| Indicadores | ✅ Lectura | Ver datos económicos |
| Panel Admin | ❌ No | Reservado para admins |

**Llamado a Acción:** "Registrate ahora para acceso completo"

---

### 👤 Usuario USER (Registrado básico)
**Permisos:** Uso completo de herramientas públicas

| Módulo | Acceso | Detalles |
|--------|--------|----------|
| Chat RIALTOR | ✅ Completo | Conversaciones ilimitadas, historial |
| Calculadoras | ✅ Completo | Historial guardado |
| Generador Placas | ❌ No | Solo para Agentes |
| Base de Conocimiento | ✅ Lectura/Comentarios | Puede comentar artículos |
| Noticias | ✅ Completo | Filtros avanzados |
| Indicadores | ✅ Completo | Alertas personalizadas |
| Mi Perfil | ✅ Editable | Nombre, email, avatar |
| Newsletter | ✅ Suscripción | Recibir campañas |

**Ideal para:** Clientes finales, personas interesadas

---

### 🏢 Usuario AGENTE (Profesional inmobiliario)
**Permisos:** Acceso a herramientas profesionales

| Módulo | Acceso | Detalles |
|--------|--------|----------|
| Chat RIALTOR | ✅ Profesional | Especializado, búsqueda web |
| Calculadoras | ✅ Todas | Comisiones, impuestos, ROI |
| Generador Placas | ✅ Completo | Standard, Premium, VIP |
| Formularios/Documentos | ✅ Editor completo | Crear, editar, descargar |
| Base de Conocimiento | ✅ Lectura + Contribuir | Puede agregar artículos |
| Noticias | ✅ Completo | Filtros, importancia |
| Indicadores | ✅ Widget + Completo | En sidebar + página dedicada |
| Mi Perfil | ✅ Avanzado | Foto, oficina, especialidades |
| Favoritos | ✅ Completo | Guardar propiedades y docs |
| Calendario | ✅ Completo | Citas, recordatorios, exportar |
| Newsletter | ✅ Crear | Enviar campañas a contactos |
| Reportes | ✅ Personal | Ver mis operaciones |
| Panel Admin | ❌ No | Solo admin puede acceder |

**Ideal para:** Agentes inmobiliarios activos

---

### 👨‍💼 Usuario ADMIN (Administrador)
**Permisos:** Control total del sistema

| Módulo | Acceso | Detalles |
|--------|--------|----------|
| Chat RIALTOR | ✅ Completo + Monitoreo | Ver conversaciones de otros |
| Calculadoras | ✅ Administrar | Crear nuevas, modificar tasas |
| Generador Placas | ✅ Administrar | Ver todas las placas, eliminar |
| Formularios/Documentos | ✅ Administrar | Gestionar carpetas y templates |
| Base de Conocimiento | ✅ Total | Crear, editar, publicar, borrar |
| Noticias | ✅ Moderar | Aprobar/rechazar contenido |
| Indicadores | ✅ Administrar | Configurar fuentes |
| Newsletter | ✅ Total | Crear, enviar, analítica |
| Panel Admin | ✅ Completo | Dashboard, usuarios, settings |
| Usuarios | ✅ CRUD | Crear, editar, eliminar, roles |
| Roles y Permisos | ✅ Editar | Modificar permisos de roles |
| Configuración Global | ✅ Total | Tasas, URLs, límites |
| Logs y Auditoría | ✅ Ver | Historial de todas las acciones |
| Respaldos | ✅ Manual | Descargar backups |
| Analytics | ✅ Completo | Reportes avanzados |

**Ideal para:** Gerentes, directores, supervisores

---

## 🛠️ CATÁLOGO COMPLETO DE FUNCIONALIDADES

### 1. CHAT RIALTOR 🤖

**Descripción:** Asistente IA especializado en sector inmobiliario argentino

#### Características Técnicas:
```
✅ Modelo: OpenAI GPT-4o
✅ Búsqueda Web: Integrada (Tavily)
✅ Historial: 20 últimos mensajes
✅ Function Calling: 4 herramientas
✅ Velocidad: <2 segundos por respuesta
✅ Idioma: Español (Argentina)
✅ Sesiones: Persistentes por usuario
```

#### Capacidades:
- **Preguntas sobre sector:** Regulaciones, procesos, normativas
- **Búsqueda web:** Información actualizada (dólar, noticias, precios)
- **Cálculos:** Comisiones, gastos, impuestos
- **Asesoramiento:** Inversión, rentabilidad, oportunidades
- **Documentación:** Guías de procesos, checklists
- **Análisis:** De mercado, de propiedades, de ofertas

#### Ejemplos de Preguntas:
```
1. "¿Cuál es el precio del dólar blue hoy?"
   → Búsqueda web + respuesta actualizada

2. "Calcular comisión para $200.000, 4% en GBA"
   → Función automática + resultado desglosado

3. "¿Qué es el ITI y cómo se calcula?"
   → Respuesta de base de conocimiento + ejemplo

4. "¿Cuáles son los requisitos para comprar en CABA?"
   → Información completa + pasos a seguir

5. "Tengo $50k USD, ¿dónde invierto?"
   → Análisis de opciones + recomendaciones
```

#### Integración:
- Chat flotante en todas las páginas
- Accesible desde cualquier sección
- Historial guardado automáticamente
- Exportar conversaciones

---

### 2. CALCULADORAS FINANCIERAS 🧮

#### A. Calculadora de Comisiones

**Entrada:**
```
- Monto de operación (pesos/dólares)
- Porcentaje de comisión (3-5%)
- Zona (CABA, GBA, Interior)
- Tipo contribuyente (Monotributista/RI)
```

**Salida:**
```
├─ Comisión bruta
├─ IVA (21%)
├─ IIBB (por provincia/zona)
├─ Impuesto a Ganancias
├─ Sellos
├─ Otros impuestos
└─ TOTAL NETO
```

**Precisión:** 99.9%  
**Actualización:** Tasas anuales  
**Historial:** Guardado automático

---

#### B. Calculadora de Gastos de Escrituración

**Entrada:**
```
- Valor de la propiedad
- Provincia
- Tipo de operación (compraventa, hipoteca, donación)
```

**Salida:**
```
├─ Impuesto de Sellos
├─ ITI (Impuesto Transferencia Inmuebles)
├─ Honorarios Escribano
├─ Tasas Municipales
├─ Otros gastos
└─ TOTAL (Comprador + Vendedor)
```

**Cobertura:** 24 provincias argentinas  
**Actualización:** Mensual  

---

#### C. Calculadora de Ganancia Inmobiliaria

**Entrada:**
```
- Precio de venta
- Precio de compra
- Mejoras realizadas
- Gastos deducibles
```

**Salida:**
```
├─ Base imponible
├─ Impuesto 15%
├─ Retención estimada
└─ Asesoramiento fiscal
```

---

#### D. Calculadora de Créditos

**Entrada:**
```
- Monto del préstamo
- Tasa de interés anual
- Período (años)
- Tipo de amortización
```

**Salida:**
```
├─ Cuota mensual
├─ Total a pagar
├─ Total de intereses
├─ Tabla de amortización
└─ Comparativa de tasas
```

---

#### E. Calculadora de ROI

**Entrada:**
```
- Inversión inicial
- Ingresos anuales (alquileres)
- Gastos anuales (mantenimiento, impuestos)
- Período de análisis
```

**Salida:**
```
├─ ROI anual %
├─ Período de recuperación
├─ Proyección 5 años
├─ Comparativa con otras inversiones
└─ Rentabilidad real
```

---

### 3. GENERADOR DE PLACAS INMOBILIARIAS 🖼️

#### Modelo STANDARD
**Características:**
- 1 a 10 imágenes libres
- Posicionamiento automático por IA
- Análisis de fotos opcional
- Texto automático
- Resolución: 1080x1080px

**Caso de uso:** Publicación rápida en redes

---

#### Modelo PREMIUM
**Características:**
- 1 a 10 imágenes libres
- Foto del agente en zócalo
- Análisis IA para descripción
- Logo de inmobiliaria
- Resolución: 1080x1080px

**Caso de uso:** Agente destacado, profesional

---

#### Modelo VIP
**Características:**
- 3 imágenes específicas (Interior, Exterior, Agente)
- Template personalizado de fondo
- Foto del agente circular (destacada)
- Posicionamiento predefinido
- Textos personalizados
- Resolución: 1080x1080px

**Caso de uso:** Propiedades premium, exclusivas

**Ventaja:** Genera impacto visual máximo en 30 segundos

---

### 4. EDITOR DE DOCUMENTOS 📄

#### Tipos de Documentos

**Contratos de Alquiler:**
- Cláusulas standard actualizadas
- Campos personalizables
- Cumple Ley de Alquileres
- Exportación Word/PDF

**Boletos de Compraventa:**
- Redacción legal
- Integración de datos del comprador/vendedor
- Firma digital opcional
- Archivo para escribano

**Formularios de Reserva:**
- Captura de datos automática
- Validación de campos
- Generación de comprobante
- Almacenamiento seguro

---

#### Funcionalidades del Editor

```
✅ Editor WYSIWYG (TipTap)
✅ Toolbar: Negrita, cursiva, listas, títulos
✅ Previsualización en tiempo real
✅ Undo/Redo
✅ Búsqueda y reemplazo
✅ Guardar versiones
✅ Exportar múltiples formatos
✅ Descargar original
✅ Generar documento completado
```

---

### 5. BASE DE CONOCIMIENTO 📚

**Contenido disponible:**
- Normativas de alquiler Argentina
- Proceso de compraventa paso a paso
- Guías de créditos hipotecarios
- Obligaciones fiscales del agente
- Colegios profesionales y matrículas
- Tendencias del mercado anual
- Checklist de documentación
- Solución de conflictos

**Características:**
```
✅ Búsqueda global
✅ Categorización jerárquica
✅ Tags para clasificación
✅ Artículos destacados
✅ Historial de versiones
✅ Comentarios moderable
✅ Rating de utilidad
✅ Exportable a PDF
```

---

### 6. NOTICIAS Y RSS 📰

**Fuentes integradas:**
- Clarín Inmobiliario
- La Nación Negocios
- Infobae Mercado
- Feeds especializados sector real estate

**Funcionalidades:**
```
✅ Actualización automática cada 10 min
✅ Categorización por tema
✅ Búsqueda de noticias
✅ Filtro por fecha
✅ Lectura completa
✅ Compartir en redes
✅ Guardar favoritos
✅ Notificaciones opcionales
```

---

### 7. INDICADORES ECONÓMICOS 📊

#### Cotizaciones

```
💵 Dólar Oficial
   - Comprador
   - Vendedor
   
🔵 Dólar Blue
   - Comprador
   - Vendedor
   
💳 Dólar Tarjeta
   - Comprador
   - Vendedor
```

#### Precios del Mercado

```
🏠 CABA
   - Precio m² venta
   - Precio m² alquiler
   
📍 Buenos Aires
   - Precio m² venta
   - Precio m² alquiler
   
📈 Comparativa por zona
```

#### Estadísticas

```
📊 Escrituraciones mensuales
📈 Tendencia mercado
⚖️ Oferta vs Demanda
⏱️ Tiempos de venta promedio
```

**Actualización:** Cada 5 minutos  
**Fuentes:** APIs públicas especializadas  
**Precisión:** +95%

---

### 8. NEWSLETTER 📧

**Funcionalidades:**

```
✅ Crear campañas visuales
✅ Editor drag & drop
✅ Plantillas profesionales
✅ Personalización dinámica (nombre, datos)
✅ Segmentación de audiencia
✅ Programación de envío
✅ Estadísticas:
   - Tasa apertura
   - Clicks en links
   - Conversiones
   - A/B testing
✅ Exportar reportes
```

**Uso típico:**
- Campañas de propiedades
- Avisos de cambios de mercado
- Comunicación con clientes
- Promociones especiales

---

### 9. GESTOR DE FAVORITOS ⭐

```
✅ Guardar propiedades
✅ Guardar documentos
✅ Guardar artículos
✅ Carpetas personalizadas
✅ Compartir listas
✅ Sincronización en tiempo real
✅ Notificaciones de cambios
✅ Exportar lista
```

---

### 10. CALENDARIO 📅

```
✅ Ver citas programadas
✅ Crear nuevas citas
✅ Recordatorios automáticos
✅ Colores por categoría
✅ Exportar a iCal/Outlook
✅ Compartir con colegas
✅ Vista día/semana/mes
✅ Búsqueda de citas
```

---

### 11. PANEL ADMINISTRATIVO 👨‍💼

#### Dashboard
```
✅ Estadísticas en tiempo real
   - Usuarios activos
   - Operaciones hoy
   - Documentos generados
   - Placas creadas
   - Consultas al chat
✅ Gráficos de tendencia
✅ Alertas de errores
✅ Estado de sistema
```

#### Gestión de Usuarios
```
✅ CRUD (Crear, editar, eliminar)
✅ Asignar roles
✅ Cambiar permisos
✅ Desactivar usuarios
✅ Ver historial de login
✅ Exportar lista
```

#### Gestión de Contenido
```
✅ Crear/editar artículos
✅ Aprobar comentarios
✅ Gestionar categorías
✅ Publicar noticias
✅ Editar templates
```

#### Configuración
```
✅ Tasas e impuestos por provincia
✅ URLs de integraciones
✅ Límites de carga
✅ Variables globales
✅ Configuración de email
```

---

### 12. SEGURIDAD Y AUTENTICACIÓN 🔒

```
✅ Registro/Login seguro
✅ Recuperación de contraseña
✅ JWT tokens con expiración
✅ Refresco automático de sesión
✅ Roles y permisos granulares
✅ Contraseñas hasheadas (nunca en texto)
✅ Validación de inputs
✅ Sanitización de datos
✅ HTTPS obligatorio
✅ Rate limiting en APIs
✅ Logs de auditoría
```

---

## 📊 MATRIZ RESUMEN

### Por Funcionalidad

| Funcionalidad | Grupo 1 | Grupo 2 | Grupo 3 | Comentario |
|--------------|---------|---------|---------|-----------|
| Chat IA | ✅ User | ✅ Agente | ✅ Admin | Especializado por rol |
| Calculadoras | ✅ User | ✅ Agente | ✅ Admin | Historial solo logeados |
| Placas | ❌ | ✅ Agente | ✅ Admin | Profesional solamente |
| Documentos | ❌ | ✅ Agente | ✅ Admin | Edición profesional |
| Wiki | ✅ User | ✅ Agente | ✅ Admin | Lectura pública |
| Noticias | ✅ User | ✅ Agente | ✅ Admin | Público + filtros |
| Indicadores | ✅ User | ✅ Agente | ✅ Admin | Datos públicos en vivo |
| Newsletter | Suscriptor | Crear | Crear | Segmentación avanzada |
| Favoritos | ✅ User | ✅ Agente | ✅ Admin | Privado por usuario |
| Calendario | ✅ User | ✅ Agente | ✅ Admin | Sincronizado |
| Admin Panel | ❌ | ❌ | ✅ Admin | Control total |

---

## 🚀 RECOMENDACIONES DE USO

### Para Maximizar Productividad:

1. **Mañana (Contexto):**
   - Abrir RIALTOR
   - Ver indicadores económicos (5 min)
   - Leer noticias relevantes (10 min)
   - Preparar estrategia del día

2. **Con Cliente (Asesoramiento):**
   - Usar Chat para preguntas complejas
   - Calculadora para mostrar transparencia
   - Documentos para profesionalismo
   - Indicadores para negociar

3. **Tarde (Operaciones):**
   - Generar placas para publicar
   - Preparar contratos
   - Newsletter a base de clientes
   - Archivar en favoritos

4. **Cierre (Seguimiento):**
   - Agendar citas en calendario
   - Guardar documentos finales
   - Registrar en calculadora
   - Análisis del día

---

## 📞 SOPORTE TÉCNICO

**Documentación completa en:**
- MODULOS_FUNCIONALIDADES_COMPLETO.md
- MODULOS_RESUMEN_EJECUTIVO.md
- MODULOS_ARQUITECTURA_CASOS_USO.md
- CHAT_README.md
- CHAT_IMPROVEMENTS.md
- PLACAS_VIP_README.md
- FORMULARIOS_SETUP.md
- INDICADORES_README.md

**Contacto:** Tabix Group - Equipo de Desarrollo

---

*Última actualización: 18 de Diciembre de 2025*

