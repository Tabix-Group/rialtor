const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Create a Stripe Checkout Session for new user subscription
 * POST /api/stripe/create-checkout-session
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { planType, userId } = req.body;

    if (!planType || !userId) {
      return res.status(400).json({ error: 'planType and userId are required' });
    }

    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ error: 'planType must be "monthly" or "yearly"' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the appropriate price ID from environment variables
    const priceId = planType === 'monthly' 
      ? process.env.STRIPE_PRICE_ID_MONTHLY 
      : process.env.STRIPE_PRICE_ID_YEARLY;

    if (!priceId) {
      return res.status(500).json({ error: `Stripe Price ID for ${planType} plan not configured` });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planType: planType,
      },
      allow_promotion_codes: true, // Enable coupon codes
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    next(error);
  }
};

/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[Stripe Webhook] Event received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle checkout.session.completed event
 */
const handleCheckoutSessionCompleted = async (session) => {
  console.log('[Stripe] Checkout session completed:', session.id);

  const userId = session.metadata.userId;
  const planType = session.metadata.planType;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update user in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlanType: planType,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`[Stripe] User ${userId} activated with ${planType} subscription`);
};

/**
 * Handle customer.subscription.updated event
 */
const handleSubscriptionUpdated = async (subscription) => {
  console.log('[Stripe] Subscription updated:', subscription.id);

  // Find user by subscription ID
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscription.id },
  });

  if (!user) {
    console.error('[Stripe] User not found for subscription:', subscription.id);
    return;
  }

  // Update subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      // Deactivate if subscription is no longer active
      isActive: ['active', 'trialing'].includes(subscription.status),
    },
  });

  console.log(`[Stripe] User ${user.id} subscription updated to: ${subscription.status}`);
};

/**
 * Handle customer.subscription.deleted event
 */
const handleSubscriptionDeleted = async (subscription) => {
  console.log('[Stripe] Subscription deleted:', subscription.id);

  // Find user by subscription ID
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscription.id },
  });

  if (!user) {
    console.error('[Stripe] User not found for subscription:', subscription.id);
    return;
  }

  // Deactivate user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: false,
      subscriptionStatus: 'canceled',
    },
  });

  console.log(`[Stripe] User ${user.id} deactivated (subscription canceled)`);
};

/**
 * Handle invoice.payment_failed event
 */
const handlePaymentFailed = async (invoice) => {
  console.log('[Stripe] Payment failed for invoice:', invoice.id);

  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  // Find user by subscription ID
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscriptionId },
  });

  if (!user) {
    console.error('[Stripe] User not found for subscription:', subscriptionId);
    return;
  }

  // Update subscription status (but keep user active for grace period)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  console.log(`[Stripe] User ${user.id} marked as past_due`);
};

/**
 * Handle invoice.payment_succeeded event
 */
const handlePaymentSucceeded = async (invoice) => {
  console.log('[Stripe] Payment succeeded for invoice:', invoice.id);

  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  // Find user by subscription ID
  const user = await prisma.user.findFirst({
    where: { subscriptionId: subscriptionId },
  });

  if (!user) return;

  // Get updated subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update user status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`[Stripe] User ${user.id} payment succeeded, reactivated`);
};

/**
 * Get subscription details for a user
 * GET /api/stripe/subscription/:userId
 */
const getSubscriptionDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if requesting user is the same or has admin permissions
    if (req.user.id !== userId && !req.user.roleAssignments.some(ra => 
      ra.role.permissions.some(p => p.name === 'manage_users')
    )) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlanType: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        requiresSubscription: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has a subscription, get additional details from Stripe
    let stripeDetails = null;
    if (user.subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
      stripeDetails = {
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    res.json({
      ...user,
      stripeDetails,
    });
  } catch (error) {
    console.error('[Stripe] Error getting subscription details:', error);
    next(error);
  }
};

/**
 * Cancel a user's subscription (Admin only)
 * POST /api/stripe/cancel-subscription
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const { userId, immediately } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({ error: 'User has no active subscription' });
    }

    // Cancel subscription in Stripe
    if (immediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(user.subscriptionId);
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(user.subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        cancelAtPeriodEnd: !immediately,
        subscriptionStatus: immediately ? 'canceled' : user.subscriptionStatus,
        isActive: !immediately, // Deactivate immediately if immediately is true
      },
    });

    res.json({ 
      success: true, 
      message: immediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will cancel at period end' 
    });
  } catch (error) {
    console.error('[Stripe] Error canceling subscription:', error);
    next(error);
  }
};

/**
 * Process a refund for a user (Admin only)
 * POST /api/stripe/refund
 */
const processRefund = async (req, res, next) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({ error: 'User has no subscription' });
    }

    // Get the latest invoice for this subscription
    const invoices = await stripe.invoices.list({
      subscription: user.subscriptionId,
      limit: 1,
    });

    if (invoices.data.length === 0) {
      return res.status(400).json({ error: 'No invoices found for this subscription' });
    }

    const latestInvoice = invoices.data[0];

    if (!latestInvoice.charge) {
      return res.status(400).json({ error: 'No charge found for the latest invoice' });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: latestInvoice.charge,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if partial refund
      reason: reason || 'requested_by_customer',
      metadata: {
        userId: user.id,
        adminId: req.user.id,
      },
    });

    // If full refund, cancel subscription
    if (!amount || amount >= latestInvoice.amount_paid / 100) {
      await stripe.subscriptions.cancel(user.subscriptionId);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          subscriptionStatus: 'canceled',
        },
      });
    }

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('[Stripe] Error processing refund:', error);
    next(error);
  }
};

/**
 * Create a billing portal session (for users to manage their subscription)
 * POST /api/stripe/create-portal-session
 */
const createPortalSession = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe] Error creating portal session:', error);
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionDetails,
  cancelSubscription,
  processRefund,
  createPortalSession,
};
