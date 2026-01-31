# 🚀 Quick Start - Stripe Subscription Setup

Esta guía te ayudará a configurar las suscripciones de Stripe en menos de 15 minutos.

## ✅ Pre-requisitos

- [ ] Base de datos PostgreSQL actualizada (migración ya aplicada)
- [ ] Dependencia `stripe` instalada en backend (ya instalada)
- [ ] Cuenta de Stripe (crear si no existe)

## 📝 Pasos de Configuración

### 1. Configurar Stripe (5 minutos)

#### A. Crear cuenta o login
```
https://dashboard.stripe.com/register
```

#### B. Obtener claves API
```
https://dashboard.stripe.com/test/apikeys
```
- Copiar **Publishable key** (pk_test_...)
- Copiar **Secret key** (sk_test_...)

#### C. Crear productos
```
https://dashboard.stripe.com/test/products
```

**Producto 1: Plan Mensual**
- Name: `Rialtor Pro - Mensual`
- Price: `$25.00 USD`
- Billing: `Monthly`
- Copiar **Price ID** (price_...)

**Producto 2: Plan Anual**
- Name: `Rialtor Pro - Anual`
- Price: `$240.00 USD`
- Billing: `Yearly`
- Copiar **Price ID** (price_...)

#### D. Configurar Webhook
```
https://dashboard.stripe.com/test/webhooks
```

1. Click "Add endpoint"
2. URL: `https://tu-backend.railway.app/api/stripe/webhook`
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copiar **Signing secret** (whsec_...)

### 2. Configurar Variables de Entorno (3 minutos)

#### Backend (Railway o .env local)

```bash
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_AQUI
STRIPE_PRICE_ID_MONTHLY=price_TU_PRICE_ID_MENSUAL
STRIPE_PRICE_ID_YEARLY=price_TU_PRICE_ID_ANUAL
```

#### Frontend (Vercel o .env.local)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
```

### 3. Migrar Usuarios Existentes (2 minutos)

Ejecutar en tu base de datos PostgreSQL:

```sql
-- Marcar usuarios existentes como legacy (no requieren suscripción)
UPDATE users 
SET requires_subscription = false 
WHERE created_at < NOW();
```

O desde el código (crear un script temporal):

```javascript
// backend/scripts/migrate-legacy-users.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      createdAt: {
        lt: new Date('2026-01-31')
      }
    },
    data: {
      requiresSubscription: false
    }
  });
  
  console.log(`✅ Migrated ${result.count} users to legacy status`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

Ejecutar:
```bash
cd backend
node scripts/migrate-legacy-users.js
```

### 4. Testing (5 minutos)

#### A. Probar Registro con Pago

1. Ir a `/auth/register`
2. Crear nuevo usuario
3. Verificar redirección a `/pricing`
4. Seleccionar plan
5. Usar tarjeta de prueba: `4242 4242 4242 4242`
6. Completar pago
7. Verificar activación automática

#### B. Probar Panel Admin

1. Login como admin
2. Ir a Admin Panel > Usuarios
3. Verificar columnas de suscripción
4. Probar botón de cancelar suscripción
5. Probar botón de reembolso (solo en test mode)

### 5. Deploy (Opcional)

#### Railway (Backend)

```bash
# Agregar variables de entorno en Railway Dashboard
railway variables set STRIPE_SECRET_KEY=sk_test_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set STRIPE_PRICE_ID_MONTHLY=price_...
railway variables set STRIPE_PRICE_ID_YEARLY=price_...

# Deploy
git push
```

#### Vercel (Frontend)

```bash
# En Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Deploy
vercel --prod
```

---

## 🧪 Tarjetas de Prueba

**Pago exitoso:**
- `4242 4242 4242 4242` - Cualquier fecha futura, cualquier CVC

**Pago fallido:**
- `4000 0000 0000 0002` - Declined

**Requiere autenticación:**
- `4000 0025 0000 3155` - 3D Secure

---

## ✅ Verificación Final

- [ ] Nuevo usuario puede registrarse y pagar
- [ ] Usuario se activa automáticamente después del pago
- [ ] Webhook funciona correctamente
- [ ] Admin puede ver estado de suscripciones
- [ ] Admin puede cancelar suscripciones
- [ ] Admin puede procesar reembolsos
- [ ] Usuarios legacy pueden acceder sin pagar

---

## 🐛 Troubleshooting Rápido

**Usuario no se activa después del pago:**
1. Verificar webhook en Stripe Dashboard > Webhooks
2. Ver logs del backend para errors
3. Verificar que `STRIPE_WEBHOOK_SECRET` sea correcto

**Error "Active subscription required":**
1. Verificar estado de suscripción en base de datos
2. Para usuarios legacy, asegurarse `requiresSubscription = false`

**Webhook no funciona:**
1. Verificar URL del webhook sea pública y accesible
2. Verificar eventos configurados en Stripe
3. Test con `stripe trigger checkout.session.completed`

---

## 📚 Documentación Completa

Para información detallada, ver: `STRIPE_INTEGRATION_GUIDE.md`

---

## 🎉 ¡Listo!

Tu sistema de suscripciones está configurado. Los nuevos usuarios ahora deberán pagar para activar sus cuentas.

**Próximos pasos:**
1. Cambiar a claves de producción cuando estés listo
2. Activar emails transaccionales en Stripe
3. Configurar facturación automática
4. Monitorear métricas de suscripciones

---

**Soporte:** Si tienes problemas, revisa la guía completa o contacta al equipo de desarrollo.
