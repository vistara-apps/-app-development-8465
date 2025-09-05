import { loadStripe } from '@stripe/stripe-js'

/**
 * Stripe integration for Dream Weaver subscription management
 */

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
let stripePromise = null

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey)
} else {
  console.warn('Stripe publishable key not found. Payment features will be disabled.')
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 dreams per month',
      '3 AI interpretations per month',
      'Basic pattern tracking',
      'Local data storage'
    ],
    limits: {
      dreamsPerMonth: 5,
      interpretationsPerMonth: 3,
      patternAnalysis: false,
      dataExport: false,
      advancedInsights: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 5,
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited dreams',
      'Unlimited AI interpretations',
      'Advanced pattern tracking',
      'Encrypted cloud storage',
      'Data export'
    ],
    limits: {
      dreamsPerMonth: Infinity,
      interpretationsPerMonth: Infinity,
      patternAnalysis: true,
      dataExport: true,
      advancedInsights: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 15,
    priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Pro',
      'Personalized AI coaching',
      'Advanced dream insights',
      'Priority support',
      'Early access to new features'
    ],
    limits: {
      dreamsPerMonth: Infinity,
      interpretationsPerMonth: Infinity,
      patternAnalysis: true,
      dataExport: true,
      advancedInsights: true
    }
  }
}

/**
 * Check if Stripe is configured
 * @returns {boolean} True if Stripe is available
 */
export const isStripeConfigured = () => {
  return stripePromise !== null
}

/**
 * Get Stripe instance
 * @returns {Promise<Stripe|null>} Stripe instance or null
 */
export const getStripe = async () => {
  if (!stripePromise) return null
  return await stripePromise
}

/**
 * Create a checkout session for subscription
 * @param {string} priceId - Stripe price ID
 * @param {string} customerId - Stripe customer ID (optional)
 * @param {string} successUrl - Success redirect URL
 * @param {string} cancelUrl - Cancel redirect URL
 * @returns {Promise<Object>} Checkout session response
 */
export const createCheckoutSession = async (priceId, customerId = null, successUrl = null, cancelUrl = null) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured')
  }

  const defaultSuccessUrl = `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
  const defaultCancelUrl = `${window.location.origin}/subscription/cancel`

  try {
    // In a real application, this would be a server-side API call
    // For now, we'll simulate the response structure
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: successUrl || defaultSuccessUrl,
        cancelUrl: cancelUrl || defaultCancelUrl,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const session = await response.json()
    return session
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    throw new Error('Unable to start checkout process. Please try again.')
  }
}

/**
 * Redirect to Stripe Checkout
 * @param {string} priceId - Stripe price ID
 * @param {string} customerId - Stripe customer ID (optional)
 * @returns {Promise<void>}
 */
export const redirectToCheckout = async (priceId, customerId = null) => {
  if (!isStripeConfigured()) {
    throw new Error('Payment processing is not available')
  }

  try {
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe failed to load')
    }

    // Create checkout session
    const session = await createCheckoutSession(priceId, customerId)
    
    // Redirect to checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Checkout redirect failed:', error)
    throw new Error('Unable to process payment. Please try again.')
  }
}

/**
 * Create a customer portal session
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - Return URL after portal session
 * @returns {Promise<string>} Portal session URL
 */
export const createPortalSession = async (customerId, returnUrl = null) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured')
  }

  const defaultReturnUrl = `${window.location.origin}/dashboard`

  try {
    // In a real application, this would be a server-side API call
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: returnUrl || defaultReturnUrl,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const session = await response.json()
    return session.url
  } catch (error) {
    console.error('Portal session creation failed:', error)
    throw new Error('Unable to access billing portal. Please try again.')
  }
}

/**
 * Get subscription plan by ID
 * @param {string} planId - Plan ID
 * @returns {Object|null} Subscription plan or null
 */
export const getSubscriptionPlan = (planId) => {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId) || null
}

/**
 * Check if user can perform action based on subscription limits
 * @param {string} subscriptionTier - User's subscription tier
 * @param {string} action - Action to check (e.g., 'createDream', 'getInterpretation')
 * @param {Object} usage - Current usage stats
 * @returns {boolean} True if action is allowed
 */
export const checkSubscriptionLimit = (subscriptionTier, action, usage = {}) => {
  const plan = getSubscriptionPlan(subscriptionTier)
  if (!plan) return false

  switch (action) {
    case 'createDream':
      if (plan.limits.dreamsPerMonth === Infinity) return true
      return (usage.dreamsThisMonth || 0) < plan.limits.dreamsPerMonth

    case 'getInterpretation':
      if (plan.limits.interpretationsPerMonth === Infinity) return true
      return (usage.interpretationsThisMonth || 0) < plan.limits.interpretationsPerMonth

    case 'patternAnalysis':
      return plan.limits.patternAnalysis

    case 'dataExport':
      return plan.limits.dataExport

    case 'advancedInsights':
      return plan.limits.advancedInsights

    default:
      return false
  }
}

/**
 * Get usage limits for subscription tier
 * @param {string} subscriptionTier - User's subscription tier
 * @returns {Object} Usage limits
 */
export const getUsageLimits = (subscriptionTier) => {
  const plan = getSubscriptionPlan(subscriptionTier)
  return plan ? plan.limits : SUBSCRIPTION_PLANS.FREE.limits
}

/**
 * Calculate usage percentage for a limit
 * @param {number} current - Current usage
 * @param {number} limit - Usage limit
 * @returns {number} Usage percentage (0-100)
 */
export const calculateUsagePercentage = (current, limit) => {
  if (limit === Infinity) return 0
  return Math.min(100, Math.round((current / limit) * 100))
}

/**
 * Mock Stripe functions for development
 */
export const mockStripe = {
  /**
   * Mock checkout redirect
   * @param {string} priceId - Price ID
   * @returns {Promise<void>}
   */
  redirectToCheckout: async (priceId) => {
    console.log('Mock Stripe: Redirecting to checkout for price:', priceId)
    
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In development, just show an alert
    alert(`Mock Stripe Checkout\n\nPrice ID: ${priceId}\n\nIn production, this would redirect to Stripe Checkout.`)
    
    // Simulate successful subscription
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.priceId === priceId)
    if (plan) {
      // Update user's subscription in localStorage for demo
      const user = JSON.parse(localStorage.getItem('dreamWeaver_user') || '{}')
      user.subscriptionTier = plan.id
      localStorage.setItem('dreamWeaver_user', JSON.stringify(user))
      
      // Reload page to reflect changes
      window.location.reload()
    }
  },

  /**
   * Mock portal session
   * @returns {Promise<void>}
   */
  createPortalSession: async () => {
    console.log('Mock Stripe: Creating portal session')
    alert('Mock Stripe Portal\n\nIn production, this would redirect to the Stripe customer portal.')
  }
}

/**
 * Subscription management utilities
 */
export const subscriptionUtils = {
  /**
   * Get user's current plan
   * @param {string} subscriptionTier - User's subscription tier
   * @returns {Object} Current plan details
   */
  getCurrentPlan: (subscriptionTier) => {
    return getSubscriptionPlan(subscriptionTier) || SUBSCRIPTION_PLANS.FREE
  },

  /**
   * Get available upgrade options
   * @param {string} currentTier - Current subscription tier
   * @returns {Array} Available upgrade plans
   */
  getUpgradeOptions: (currentTier) => {
    const plans = Object.values(SUBSCRIPTION_PLANS)
    const currentPlan = getSubscriptionPlan(currentTier)
    
    if (!currentPlan) return plans.filter(p => p.id !== 'free')
    
    return plans.filter(p => p.price > currentPlan.price)
  },

  /**
   * Format price for display
   * @param {number} price - Price in dollars
   * @returns {string} Formatted price
   */
  formatPrice: (price) => {
    if (price === 0) return 'Free'
    return `$${price}/month`
  },

  /**
   * Get plan comparison data
   * @returns {Array} Plan comparison data
   */
  getPlanComparison: () => {
    return Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      ...plan,
      formattedPrice: subscriptionUtils.formatPrice(plan.price)
    }))
  }
}
