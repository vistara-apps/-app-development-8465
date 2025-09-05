import React, { useState } from 'react'
import { Moon, Stars, Sparkles } from 'lucide-react'

export const AuthModal = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate authentication
    const userData = {
      id: '1',
      name: formData.name || 'Dream Explorer',
      email: formData.email || 'user@dreamweaver.com',
      subscriptionTier: 'free',
      createdAt: new Date().toISOString()
    }
    onLogin(userData)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Moon className="w-12 h-12 text-white" />
              <Stars className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1" />
              <Sparkles className="w-4 h-4 text-blue-300 absolute -bottom-1 -left-1" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Dream Weaver</h1>
          <p className="text-blue-100">Unlock the secrets of your subconscious</p>
        </div>

        {/* Auth Form */}
        <div className="glass-card rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-purple-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => onLogin({
                  id: '1',
                  name: 'Demo User',
                  email: 'demo@dreamweaver.com',
                  subscriptionTier: 'free'
                })}
                className="text-blue-300 hover:text-white text-sm underline transition-colors duration-200"
              >
                Continue as Demo User
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-blue-100 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>AI Interpretation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Pattern Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Secure Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}