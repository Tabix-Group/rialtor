# Integración de Suscripciones Stripe - Guía Completa

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de suscripciones con Stripe que permite:
- **Registro con pago obligatorio** para nuevos usuarios
- **Dos planes de suscripción**: $25/mes o $240/año (ahorro de $60)
- **Activación automática** después del pago exitoso via webhooks
- **Gestión completa desde panel de admin**: cancelaciones, reembolsos, visualización de estado
- **Usuarios legacy exentos**: usuarios existentes y creados por admin no requieren suscripción

---

## 🔧 Configuración Inicial

### 1. Crear cuenta de Stripe

1. Ir a https://dashboard.stripe.com/register
2. Completar el registro de la cuenta
3. Activar el modo de pruebas (test mode) para desarrollo

### 2. Obtener las claves API

#### Claves de API (https://dashboard.stripe.com/test/apikeys):
- **Publishable key** (pk_test_...): Para el frontend
- **Secret key** (sk_test_...): Para el backend

#### Webhook Secret (https://dashboard.stripe.com/test/webhooks):
1. Crear un nuevo webhook endpoint
2. URL del webhook: `https://tu-dominio.com/api/stripe/webhook` (o `https://tu-backend-railway.up.railway.app/api/stripe/webhook`)
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copiar el **Signing secret** (whsec_...)

### 3. Crear los productos y precios

#### En Dashboard > Products (https://dashboard.stripe.com/test/products):

**Plan Mensual:**
1. Create product
2. Name: "Rialtor Pro - Mensual"
3. Description: "Acceso completo a la plataforma Rialtor"
4. Pricing: Recurring - $25.00 USD - Monthly
5. Copiar el **Price ID** (price_...)

**Plan Anual:**
1. Create product
2. Name: "Rialtor Pro - Anual"
3. Description: "Acceso completo a la plataforma Rialtor (ahorra $60)"
4. Pricing: Recurring - $240.00 USD - Yearly
5. Copiar el **Price ID** (price_...)

### 4. Configurar variables de entorno

#### Backend (`backend/.env`):

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_id_plan_mensual
STRIPE_PRICE_ID_YEARLY=price_id_plan_anual

# Existing variables (asegurarse de que estén configuradas)
FRONTEND_URL=https://rialtor.app
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

#### Frontend (`frontend/.env.local` o variables de entorno de Vercel/Railway):

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
NEXT_PUBLIC_API_URL=https://remax-be-production.up.railway.app
```

---

## 🚀 Flujo de Usuario

### Nuevo Usuario (Con Suscripción)

1. Usuario se registra en `/auth/register`
2. Se crea cuenta con `isActive: false` y `requiresSubscription: true`
3. Usuario es redirigido a `/pricing?userId=...`
4. Selecciona plan (mensual o anual)
5. Es redirigido a Stripe Checkout
6. Completa el pago
7. Webhook de Stripe activa la cuenta (`isActive: true`)
8. Usuario es redirigido a `/subscription/success`
9. Puede acceder al dashboard

### Usuario Legacy o Creado por Admin

1. Admin crea usuario desde panel de admin
2. Usuario se crea con `requiresSubscription: false` e `isActive: true`
3. Usuario puede acceder inmediatamente sin pagar

---

## 🎯 Arquitectura de la Solución

### Base de Datos (Prisma Schema)

Campos agregados al modelo `User`:

```prisma
stripeCustomerId    String?   @unique   // ID del cliente en Stripe
subscriptionId      String?   @unique   // ID de la suscripción
subscriptionStatus  String?              // 'active', 'canceled', 'past_due', etc.
subscriptionPlanType String?             // 'monthly' o 'yearly'
currentPeriodEnd    DateTime?           // Fecha de renovación
cancelAtPeriodEnd   Boolean?            // Si se cancela al final del período
requiresSubscription Boolean   @default(true)  // false para legacy/admin users
```

### Backend - Endpoints Stripe

**Públicos (requieren autenticación):**
- `POST /api/stripe/create-checkout-session` - Crear sesión de pago
- `GET /api/stripe/subscription/:userId` - Ver detalles de suscripción
- `POST /api/stripe/create-portal-session` - Portal de gestión de Stripe

**Admin (requieren permiso `manage_users`):**
- `POST /api/stripe/cancel-subscription` - Cancelar suscripción
- `POST /api/stripe/refund` - Procesar reembolso

**Webhook (sin autenticación, verifica firma de Stripe):**
- `POST /api/stripe/webhook` - Recibir eventos de Stripe

### Frontend - Páginas Nuevas

- `/pricing` - Selección de planes (monthly/yearly)
- `/subscription/success` - Confirmación después del pago

### Middleware de Autenticación

Actualizado para verificar:
1. `isActive === true`
2. Si `requiresSubscription === true`, verificar `subscriptionStatus` in `['active', 'trialing']`
3. Grace period de 3 días para estado `past_due`

### Panel de Administración

Columnas nuevas en tabla de usuarios:
- **Suscripción**: Estado de la suscripción (Activo/Pendiente/Legacy)
- **Plan**: Tipo de plan ($25/mes o $240/año)
- **Renovación**: Fecha de próxima renovación

Controles nuevos:
- **Botón de Cancelar Suscripción** (icono Ban): Cancelar inmediatamente o al final del período
- **Botón de Reembolso** (icono DollarSign): Procesar reembolso total o parcial
- **Toggle de Activo/Inactivo**: Solo visible para usuarios sin suscripción (legacy/admin)

---

## 📝 Ejemplos de Uso

### Crear Checkout Session (Frontend)

```typescript
const token = localStorage.getItem('token');

const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    planType: 'monthly', // o 'yearly'
    userId: user.id
  })
});

const data = await response.json();
window.location.href = data.url; // Redirigir a Stripe Checkout
```

### Webhook Handler (Backend - ya implementado)

Los webhooks se manejan automáticamente en `stripeController.js`:
- `checkout.session.completed`: Activa el usuario
- `customer.subscription.updated`: Actualiza estado
- `customer.subscription.deleted`: Desactiva usuario
- `invoice.payment_failed`: Marca como `past_due`
- `invoice.payment_succeeded`: Reactiva usuario

### Cancelar Suscripción (Admin)

```typescript
const response = await authenticatedFetch('/api/stripe/cancel-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    immediately: false // true para cancelar inmediatamente
  })
});
```

### Procesar Reembolso (Admin)

```typescript
const response = await authenticatedFetch('/api/stripe/refund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    amount: 25, // Opcional, dejar undefined para reembolso completo
    reason: 'requested_by_customer'
  })
});
```

---

## 🧪 Testing

### Tarjetas de Prueba de Stripe

**Pago exitoso:**
- Número: `4242 4242 4242 4242`
- Fecha: Cualquier fecha futura
- CVC: Cualquier 3 dígitos
- ZIP: Cualquier 5 dígitos

**Pago declinado:**
- Número: `4000 0000 0000 0002`

**Requiere autenticación (3D Secure):**
- Número: `4000 0025 0000 3155`

### Probar Webhooks Localmente

1. Instalar Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Reenviar eventos a localhost:
   ```bash
   stripe listen --forward-to localhost:3003/api/stripe/webhook
   ```

4. Copiar el webhook secret que aparece y agregarlo a `.env` como `STRIPE_WEBHOOK_SECRET`

5. Trigger eventos de prueba:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.deleted
   ```

---

## 🔐 Seguridad

### Webhook Signature Verification

El webhook verifica automáticamente la firma de Stripe para prevenir ataques:

```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

### Body Parsing

El endpoint de webhook usa `express.raw()` para preservar el body original necesario para verificar la firma.

---

## 🐛 Troubleshooting

### Usuario no se activa después del pago

1. Verificar que el webhook esté configurado correctamente
2. Revisar logs en Stripe Dashboard > Developers > Webhooks
3. Verificar que `STRIPE_WEBHOOK_SECRET` sea correcto
4. Verificar logs del servidor backend

### Error "Active subscription required"

1. Verificar que el usuario tenga `subscriptionStatus: 'active'` o `'trialing'`
2. Verificar que `currentPeriodEnd` no haya expirado
3. Si es usuario legacy, asegurarse de que `requiresSubscription: false`

### Webhook no recibe eventos

1. Verificar que la URL del webhook sea accesible públicamente
2. Verificar que no haya firewall bloqueando Stripe IPs
3. Verificar que el endpoint retorne status 200
4. Revisar Stripe Dashboard > Webhooks para ver errores

---

## 📊 Monitoreo y Métricas

### Stripe Dashboard

- **Pagos**: Ver todos los pagos exitosos y fallidos
- **Customers**: Lista de clientes
- **Subscriptions**: Estado de todas las suscripciones
- **Webhooks**: Logs de eventos de webhook

### Base de Datos

Queries útiles:

```sql
-- Usuarios con suscripción activa
SELECT COUNT(*) FROM users WHERE subscription_status = 'active';

-- Usuarios sin suscripción (legacy)
SELECT COUNT(*) FROM users WHERE requires_subscription = false;

-- Ingresos mensuales estimados
SELECT 
  SUM(CASE 
    WHEN subscription_plan_type = 'monthly' THEN 25 
    WHEN subscription_plan_type = 'yearly' THEN 20 
  END) as monthly_revenue
FROM users 
WHERE subscription_status = 'active';

-- Suscripciones que vencen en los próximos 7 días
SELECT * FROM users 
WHERE current_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
AND subscription_status = 'active';
```

---

## 🚨 Mejores Prácticas

### Para Producción

1. **Cambiar a claves de producción**:
   - Usar claves que empiecen con `pk_live_` y `sk_live_`
   - Configurar webhook en producción con URL de producción

2. **Configurar emails transaccionales**:
   - Activar emails de Stripe para confirmación, renovación, y fallos de pago
   - Settings > Emails en Stripe Dashboard

3. **Configurar dunning (recuperación de pagos fallidos)**:
   - Settings > Billing > Subscriptions
   - Configurar reintentos automáticos

4. **Activar Radar (detección de fraude)**:
   - Settings > Radar
   - Configurar reglas de detección

5. **Backup de datos**:
   - Exportar lista de clientes y suscripciones regularmente
   - Mantener logs de todos los eventos de webhook

### Mantenimiento

- **Revisar suscripciones canceladas** mensualmente
- **Analizar razones de cancelación** en Stripe Dashboard
- **Monitorear tasa de churn** (usuarios que cancelan)
- **Actualizar precios** si es necesario (crear nuevos Price IDs)

---

## 🔄 Migración de Usuarios Existentes

Para migrar usuarios existentes:

```sql
-- Marcar todos los usuarios existentes como legacy (no requieren suscripción)
UPDATE users 
SET requires_subscription = false 
WHERE created_at < '2026-01-31';
```

O desde el panel de admin, editar usuarios individualmente y marcarlos como legacy.

---

## 📞 Soporte

### Contacto Stripe
- Dashboard: https://dashboard.stripe.com
- Documentación: https://stripe.com/docs
- Support: https://support.stripe.com

### Recursos Adicionales
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)

---

## ✅ Checklist de Deployment

- [ ] Crear cuenta de Stripe en producción
- [ ] Obtener claves de API de producción
- [ ] Crear productos y precios en producción
- [ ] Configurar webhook en producción
- [ ] Actualizar variables de entorno en Railway/Vercel
- [ ] Probar flujo completo de registro y pago
- [ ] Probar webhook de activación
- [ ] Probar cancelación desde admin panel
- [ ] Probar reembolso desde admin panel
- [ ] Activar emails transaccionales en Stripe
- [ ] Configurar Radar para detección de fraude
- [ ] Migrar usuarios existentes (marcar como legacy)
- [ ] Documentar procedimientos para el equipo

---

**Versión:** 1.0  
**Fecha:** 31 de enero de 2026  
**Autor:** Sistema de implementación Rialtor
