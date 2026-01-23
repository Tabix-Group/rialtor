# Previsualización: Sección de Comisiones Inmobiliarias

## 📱 Vista Móvil (1 columna)

```
┌─────────────────────────────────┐
│  📈 Esquemas de Comisiones      │
│     Inmobiliarias               │
│                                  │
│  Valores de mercado actuales     │
│  para diferentes tipos...        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ℹ️ Los valores mostrados son     │
│ rangos estándar del mercado...  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🏠 Venta Vivienda               │
│    CABA / PBA               ▼   │
│                                  │
│ 2 tipos de operación             │
│ Click para expandir              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🏠 Venta Local u Oficina        │
│    CABA / PBA               ▲   │
│                                  │
│ ┌─────────────────────────────┐  │
│ │ Vendedor                    │  │
│ │ Comisión a cargo del...     │  │
│ ├─────────────────────────────┤  │
│ │ Vendedor/Locador | Comprador│  │
│ │      2.00-3.00%    3.00-4.00% │
│ └─────────────────────────────┘  │
│                                  │
│ ┌─────────────────────────────┐  │
│ │ Comprador                   │  │
│ │ Comisión a cargo del...     │  │
│ ├─────────────────────────────┤  │
│ │ Vendedor/Locador | Comprador│  │
│ │      Sin comisión  3.00-4.00% │
│ └─────────────────────────────┘  │
└─────────────────────────────────┘

[... más tarjetas ...]
```

---

## 💻 Vista Desktop (2 columnas)

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Esquemas de Comisiones Inmobiliarias                        │
│     Valores de mercado actuales para diferentes tipos...        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ℹ️ Los valores mostrados son rangos estándar del mercado. Las   │
│ comisiones pueden variar según el acuerdo entre partes...       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────┐
│   🏠 Venta Vivienda              │   🏠 Venta Local u Oficina       │
│      CABA / PBA                  │      CABA / PBA                  │
│                                ▼ │                                ▼ │
│  2 tipos de operación            │  2 tipos de operación            │
│  Click para expandir              │  Click para expandir              │
└──────────────────────────────────┴──────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────┐
│   🏠 Venta Lote                  │   🏠 Alquiler Vivienda           │
│      CABA / PBA                  │      CABA                        │
│                                ▼ │                                ▲ │
│  2 tipos de operación            │   ┌────────────────────────────┐ │
│  Click para expandir              │   │ Locador                    │ │
│                                   │   │ Comisión a cargo del...    │ │
│                                   │   ├────────────────────────────┤ │
│                                   │   │ Vendedor/Locador           │ │
│                                   │   │      4.15%                 │ │
│                                   │   │ 📝 Tarifa única CABA       │ │
│                                   │   └────────────────────────────┘ │
└──────────────────────────────────┴──────────────────────────────────┘

[... más tarjetas en grid 2x2 ...]

┌──────────────────────────────────────────────────────────────────┐
│  Datos compilados de estándares del mercado inmobiliario...     │
│  Última actualización: 23/01/2026                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Interacciones Clave

### 1️⃣ Estado Colapsado (Inicial)
```
┌─────────────────────────────────┐
│ 🏠 Venta Vivienda              │
│    CABA / PBA               ▼ │
│                                 │
│ 2 tipos de operación            │
│ Click para expandir             │
└─────────────────────────────────┘
```

### 2️⃣ Estado Expandido (Después de click)
```
┌─────────────────────────────────┐
│ 🏠 Venta Vivienda              │
│    CABA / PBA               ▲ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Vendedor                    │ │
│ │ Comisión a cargo del        │ │
│ │ vendedor                    │ │
│ ├─────────────────────────────┤ │
│ │ Vendedor/Locador            │ │
│ │        2.00 - 3.00%         │ │
│ │ Comprador/Locatario         │ │
│ │        Sin mostrar (0%)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Comprador                   │ │
│ │ Comisión a cargo del        │ │
│ │ comprador                   │ │
│ ├─────────────────────────────┤ │
│ │ Vendedor/Locador            │ │
│ │        Sin mostrar (0%)      │ │
│ │ Comprador/Locatario         │ │
│ │        3.00 - 4.00%         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🎨 Paleta de Colores

### Header de Sección
```
Fondo: Linear gradient (slate-50 → slate-100)
Dark:  Linear gradient (slate-900 → slate-800)
Borde: border-border
```

### Tarjeta Colapsada
```
Fondo: bg-card
Borde: border-border
Hover: border-foreground/20
```

### Info Box
```
Fondo: bg-blue-50/50 (Light) / bg-blue-950/20 (Dark)
Borde: border-blue-200 (Light) / border-blue-800 (Dark)
Texto: text-blue-900 (Light) / text-blue-100 (Dark)
```

### Contenido Expandido
```
Fondo subtítulo: bg-muted/50
Borde subtítulo: border-border/50
Fondo valores: bg-white (Light) / bg-slate-950 (Dark)
```

---

## 📊 Datos Mostrados por Tipo

### Venta Vivienda CABA/PBA
```
Vendedor:   2.00% - 3.00%
Comprador:  3.00% - 4.00%
```

### Alquiler Vivienda CABA
```
Locador:    4.15% (Tarifa única)
Locatario:  Sin comisión (0%)
```

### Alquiler Vivienda PBA
```
Locador:    5.00%
Locatario:  3.00% - 5.00% (Opcional, 1 Mes)
```

### Alquiler Comercial CABA/PBA
```
Locador:    4.00%
Locatario:  5.00% (1 Mes)
```

### Alquiler Temporario CABA/PBA
```
Locador:    10.00%
Locatario:  20.00% (10.00%)
```

### Fondos de Comercio
```
Vendedor:   5.00%
Comprador:  5.00%
```

---

## 🌙 Tema Oscuro

```
Dark Mode Automático:
- Header: bg-gradient-to-r from-slate-900 to-slate-800
- Card: bg-card (gris oscuro configurable)
- Texto: Automáticamente en colores claros
- Bordes: Sutiles en gris oscuro
- Info Box: Fondo azul oscuro con texto azul claro

Activación: Sistema operativo o Tailwind config
```

---

## ✨ Características de UX

### Accesibilidad
- ✅ Chevron rotativo para indicar expandible
- ✅ Texto descriptivo claramente visible
- ✅ Contraste suficiente en colores
- ✅ Información no esencial en notas

### Usabilidad
- ✅ Una sección expandida a la vez
- ✅ Click en cualquier parte del header expande
- ✅ Resumen visible cuando está colapsada
- ✅ Transiciones suaves

### Performance
- ✅ Componente sin dependencias pesadas
- ✅ Datos como constante (no API calls)
- ✅ Memoización automática de objetos
- ✅ Renderizado eficiente con keys

---

## 🔧 Integración en el Flujo

### Posición en la Página

```
1. HEADER - Mis Indicadores
   ↓
2. COTIZACIONES DEL DÓLAR
   (Oficial, Blue, Tarjeta)
   ↓
3. ÍNDICE UVA
   (Valor + Info hipotecaria)
   ↓
4. 🆕 ESQUEMAS DE COMISIONES
   (Nueva sección para agentes)
   ↓
5. ÍNDICES ECONÓMICOS
   (IPC, Inflación, CAC, IS)
   ↓
6. SERIES HISTÓRICAS
   (Gráficos de tendencias)
   ↓
7. FOOTER
   (Fuentes y última actualización)
```

---

## 💡 Ventajas de Ubicación

**¿Por qué entre UVA e Índices Económicos?**

1. **Flujo Lógico**
   - Dólar → Vivienda → Comisiones → Índices económicos
   - Progresa de lo específico (dólar) a lo general (economía)

2. **Contexto para Agentes**
   - Después de ver precios (UVA/Dólar)
   - Antes de ver indicadores económicos
   - En el momento perfecto para negociaciones

3. **Separación Visual**
   - Entre dos grandes secciones (datos/gráficos)
   - No compite por atención con otros widgets
   - Fácil de scanear visualmente

4. **Relevancia Temporal**
   - Comisiones son más estables que dólar
   - Cambian menos que índices económicos
   - Justo el lugar adecuado en la jerarquía

---

## 🚀 Cómo Usa Un Agente Esta Sección

**Caso de Uso 1: Negociación de Venta**
```
Agente abre /indicadores
    ↓
Ve rápidamente rangos de mercado
    ↓
En una llamada con cliente:
"Según el mercado, rango típico es 2-3%"
    ↓
Cierra mejor comisión fundamentada
```

**Caso de Uso 2: Consulta de Alquiler**
```
Agente necesita info de alquiler temporario
    ↓
Expande "Alquiler Temporario CABA/PBA"
    ↓
Ve claramente: 10% locador, 20% locatario
    ↓
Informa a cliente con confianza
```

**Caso de Uso 3: Comparación de Operaciones**
```
Agente quiere comparar venta vs alquiler
    ↓
Expande ambas secciones
    ↓
Analiza diferencias: venta 2-4% vs alquiler 4-10%
    ↓
Aconseja mejor estrategia al propietario
```

---

**Estado**: ✅ Implementado y Listo para Producción
**Fecha**: 23 de enero de 2026
