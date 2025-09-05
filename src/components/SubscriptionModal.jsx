import React from 'react'
import { X, Check, Crown, Sparkles, Shield, TrendingUp } from 'lucide-react'

export const SubscriptionModal = ({ isOpen, onClose, currentTier }) => {
  if (!isOpen) return null

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      current: currentTier === 'free',
      features: [
        '5 dream entries per month',
        '3 AI interpretations',
        'Basic dream journal',
        'Mobile app access'
      ],
      limitations: [
        'Limited pattern analysis',
        'No data export',
        'Basic support'
      ]
    },
    {
      name: 'Pro',
      price: '$5',
      period: 'month',
      current: currentTier === 'pro',
      popular: true,
      features: [
        'Unlimited dream entries',
        'Unlimited AI interpretations',
        'Advanced pattern tracking',
        'Emotion analytics',
        'Tag cloud visualization',
        'Weekly insights',
        'Data export (JSON)',
        'Priority support'
      ]
    },
    {
      name: 'Premium',
      price: '$15',
      period: 'month',
      current: currentTier === 'premium',
      features: [
        'Everything in Pro',
        'Advanced AI coaching',
        'Personalized recommendations',
        'Lucid dreaming guidance',
        'Dream prediction models',
        'Full data export (PDF/CSV)',
        'Custom dream categories',
        'Early access to features',
        'Direct expert consultation'
      ]
    }
  ]

  const handleUpgrade = (planName) => {
    // In a real app, this would integrate with Stripe
    alert(`Upgrading to ${planName} plan. This would redirect to payment processing.`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-dark-surface rounded-2xl border border-dark-border">
        {/* Header */}
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-gray-400 mt-1">Unlock the full power of dream analysis</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl p-6 border transition-all ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-500/5 scale-105'
                    : 'border-gray-700 bg-gray-800/30'
                } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                      <Sparkles className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Current Plan</span>
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-3">
                    {plan.name === 'Premium' && <Crown className="w-8 h-8 text-yellow-400" />}
                    {plan.name === 'Pro' && <TrendingUp className="w-8 h-8 text-blue-400" />}
                    {plan.name === 'Free' && <Shield className="w-8 h-8 text-green-400" />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations && plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <X className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.current}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {plan.current 
                    ? 'Current Plan' 
                    : plan.name === 'Free' 
                      ? 'Downgrade' 
                      : `Upgrade to ${plan.name}`
                  }
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white font-medium">Can I change plans anytime?</p>
                <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <p className="text-white font-medium">Is my data secure?</p>
                <p className="text-gray-400">Absolutely. All dream entries are encrypted end-to-end and stored securely. Only you can access your data.</p>
              </div>
              <div>
                <p className="text-white font-medium">What happens if I cancel?</p>
                <p className="text-gray-400">You'll retain access to your plan features until the end of your billing period, then automatically switch to the free plan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}