# Guía de Mantenimiento: Comisiones Inmobiliarias

## 📍 Ubicación de Archivos

```
frontend/
├── src/
│   ├── app/
│   │   └── indicadores/
│   │       └── page.tsx           ← Página principal (IMPORTA el componente)
│   └── components/
│       └── RealEstateCommissions.tsx ← Componente de comisiones (NUEVO)
```

## 🔄 Cómo Actualizar los Datos

Si necesitas cambiar los valores de comisiones, edita el array `commissionsData` en [RealEstateCommissions.tsx](../frontend/src/components/RealEstateCommissions.tsx#L23):

### Estructura de un Tipo de Comisión:

```typescript
{
  name: "Vendedor",                    // Nombre del rol
  description: "Comisión a cargo...",  // Descripción
  seller: { min: 2.0, max: 3.0 },      // Rango para vendedor/locador
  buyer: { min: 3.0, max: 4.0 },       // Rango para comprador/locatario
  notes: "Tarifa única CABA"           // Notas opcionales
}
```

### Estructura de una Sección:

```typescript
{
  title: "Venta Vivienda",              // Título principal
  subtitle: "CABA / PBA",               // Ubicación/contexto
  types: [
    { /* comisión 1 */ },
    { /* comisión 2 */ }
  ]
}
```

### Ejemplo: Agregar Nuevo Tipo de Operación

```typescript
{
  title: "Venta Inmueble Comercial",
  subtitle: "CABA / PBA",
  types: [
    {
      name: "Vendedor",
      description: "Comisión a cargo del vendedor",
      seller: { min: 2.5, max: 3.5 },
      buyer: { min: 0, max: 0 },
    },
    {
      name: "Comprador",
      description: "Comisión a cargo del comprador",
      seller: { min: 0, max: 0 },
      buyer: { min: 3.5, max: 4.5 },
    },
  ],
},
```

## 🎨 Personalización Visual

### Colores Disponibles (Tailwind):

El componente usa las variables CSS del tema:
- `bg-card`: Fondo de tarjetas
- `border-border`: Bordes
- `text-muted-foreground`: Texto secundario
- `bg-primary/10`: Fondos de íconos
- `bg-blue-50/50`: Fondos informativos (light mode)

### Modificar Estructura Visual

Si quieres cambiar el layout a una sola columna:

En [RealEstateCommissions.tsx](../frontend/src/components/RealEstateCommissions.tsx#L154):

```tsx
// Cambiar esto:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

// A esto:
<div className="grid grid-cols-1 gap-4">
```

### Modificar Comportamiento Interactivo

Para que todas las secciones se expandan automáticamente:

En el `useState`:
```tsx
const [expandedSection, setExpandedSection] = useState<string | null>(
  commissionsData[0]?.title || null
)
```

## 📱 Responsive Design

El componente es responsive de serie. Breakpoints:

- **Móvil** (< 1024px): 1 columna
- **Tablet/Desktop** (≥ 1024px): 2 columnas

Para ajustar, modifica en [RealEstateCommissions.tsx](../frontend/src/components/RealEstateCommissions.tsx#L151):

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      ↑                    ↑
   Móvil              Desktop
```

## 🔍 Validación y Testing

### Checklist antes de hacer cambios:

- [ ] Verificar que los rangos tengan sentido (min ≤ max)
- [ ] Comprobar que los títulos sean descriptivos
- [ ] Validar que no haya caracteres especiales problemáticos
- [ ] Probar en móvil y desktop

### Para testear localmente:

1. Navega a `/indicadores`
2. Scroll hasta la sección "Esquemas de Comisiones Inmobiliarias"
3. Prueba expandir/colapsar tarjetas
4. Verifica responsive en DevTools (F12)

## 🌙 Dark Mode

El componente soporta dark mode automáticamente mediante:

- `dark:bg-slate-900` - Fondo oscuro
- `dark:text-blue-100` - Texto en modo oscuro
- Las variables CSS se adaptan automáticamente

Para testear: En VS Code, abre DevTools y cambia el tema.

## 📊 Integración con Otras Secciones

El componente se renderiza dentro del contenedor general:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  {/* Dólar */}
  {/* UVA */}
  {/* 🆕 COMISIONES AQUÍ */}
  <RealEstateCommissions />
  {/* Índices Económicos */}
</div>
```

## ⚡ Performance

- **Bundle Size**: Componente ligero (~8KB sin gzip)
- **Rendering**: Memoización automática de objetos estáticos
- **Interactividad**: Sin dependencias externas pesadas

## 🐛 Troubleshooting

### "No se ve la sección"
- Verifica que el componente esté importado
- Comprueba que no haya errores en consola (F12)
- Asegúrate de usar la ruta correcta: `@/components/RealEstateCommissions`

### "Los estilos se ven raros"
- Limpia el cache: `npm run dev` reinicia
- Verifica que Tailwind esté compilado
- Comprueba la variable `darkMode` en `tailwind.config.js`

### "Las comisiones no se expanden"
- Verifica que el estado `expandedSection` sea inicializado correctamente
- Comprueba que `setExpandedSection` esté siendo llamado
- Revisa la consola para errores de React

## 📈 Futuras Mejoras

Ideas para versiones posteriores:

1. **API Backend**
   - Migrar datos a base de datos
   - Endpoint: `GET /api/commissions`
   - Permitir edición desde admin panel

2. **Funcionalidades Avanzadas**
   - Comparador de comisiones
   - Calculadora de ganancia vs comisión
   - Exportar a PDF

3. **Internacionalización**
   - Traducción de textos
   - Soporte para múltiples monedas

4. **Integraciones**
   - Sincronizar con CRM
   - Notificaciones de cambios en comisiones

## 🔗 Referencias

- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Hooks Docs](https://react.dev/reference/react/hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última actualización**: 23 de enero de 2026
**Responsable**: Sistema de Indicadores Rialtor
