# 💳 Sistema de Suscripciones Stripe - README

## 🎉 Implementación Completada

Este proyecto ahora incluye un sistema completo de suscripciones con Stripe que gestiona pagos recurrentes, activación automática de usuarios, y administración completa desde el panel admin.

---

## 📖 Documentación Disponible

1. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumen ejecutivo de la implementación
2. **[STRIPE_QUICK_START.md](./STRIPE_QUICK_START.md)** - Guía rápida de configuración (15 min)
3. **[STRIPE_INTEGRATION_GUIDE.md](./STRIPE_INTEGRATION_GUIDE.md)** - Documentación técnica completa

---

## ⚡ Quick Start

### 1. Configurar Stripe (5 minutos)

```bash
# 1. Crear cuenta en https://dashboard.stripe.com
# 2. Copiar claves de test
# 3. Crear productos ($25/mes y $240/año)
# 4. Configurar webhook
```

### 2. Variables de Entorno

**Backend:**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
```

**Frontend:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Migrar Usuarios Existentes

```bash
cd backend
node scripts/migrate-legacy-users.js
```

---

## ✨ Características

- ✅ Registro con pago obligatorio
- ✅ Dos planes: Mensual ($25) y Anual ($240)
- ✅ Activación automática vía webhooks
- ✅ Usuarios legacy exentos
- ✅ Panel admin con gestión completa
- ✅ Cancelación y reembolsos
- ✅ Soporte para cupones de descuento
- ✅ Documentación completa

---

## 🎯 Flujo de Usuario

```
Registro → Pricing → Stripe Checkout → Pago → Webhook → Activación → Dashboard
```

---

## 📁 Archivos Principales

### Backend
- `src/controllers/stripeController.js` - Lógica de Stripe
- `src/routes/stripeRoutes.js` - Endpoints API
- `scripts/migrate-legacy-users.js` - Migración

### Frontend
- `src/app/pricing/page.tsx` - Selección de planes
- `src/app/subscription/success/page.tsx` - Confirmación
- `src/components/UserManagement.tsx` - Admin panel

### Docs
- `STRIPE_INTEGRATION_GUIDE.md` - Guía completa
- `STRIPE_QUICK_START.md` - Setup rápido

---

## 🧪 Testing

**Tarjeta de prueba:**
```
4242 4242 4242 4242
Fecha: Cualquier futura
CVC: Cualquier 3 dígitos
```

---

## 🚀 Deployment

1. Configurar variables de entorno en Railway/Vercel
2. Migrar usuarios existentes
3. Verificar webhook en producción
4. Probar flujo completo

**Ver [STRIPE_QUICK_START.md](./STRIPE_QUICK_START.md) para instrucciones detalladas.**

---

## 📞 Soporte

- **Documentación**: Ver archivos en raíz del proyecto
- **Stripe Docs**: https://stripe.com/docs
- **Issues**: Revisar troubleshooting en guía completa

---

## ✅ Checklist

- [ ] Stripe configurado
- [ ] Variables de entorno
- [ ] Usuarios migrados
- [ ] Webhook verificado
- [ ] Flujo probado

---

_Para más información, consultar [STRIPE_INTEGRATION_GUIDE.md](./STRIPE_INTEGRATION_GUIDE.md)_
