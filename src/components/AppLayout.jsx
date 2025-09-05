import React, { useState } from 'react'
import { 
  Moon, 
  BarChart3, 
  BookOpen, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react'

export const AppLayout = ({ children, currentView, setCurrentView, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', key: 'dashboard', icon: BarChart3 },
    { name: 'Dream Journal', key: 'journal', icon: BookOpen },
    { name: 'Settings', key: 'settings', icon: Settings },
  ]

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            onClick={() => {
              setCurrentView(item.key)
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentView === item.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.name}
          </button>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-surface border-r border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-dark-border">
            <div className="flex items-center space-x-3">
              <Moon className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-lg font-bold text-white">Dream Weaver</h1>
                <p className="text-xs text-gray-400">AI Dream Analysis</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItems />
          </nav>

          {/* User Profile */}
          <div className="px-4 py-6 border-t border-dark-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-gray-400 capitalize">{user?.subscriptionTier}</p>
                  {user?.subscriptionTier === 'premium' && (
                    <Crown className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-4 bg-dark-surface border-b border-dark-border lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-white capitalize">
              {currentView === 'dashboard' ? 'Dream Analytics' : currentView.replace('-', ' ')}
            </h2>
          </div>

          {/* Subscription Badge */}
          {user?.subscriptionTier === 'free' && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-yellow-900/30 border border-yellow-600/30 rounded-full">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Upgrade to Pro</span>
            </div>
          )}
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}