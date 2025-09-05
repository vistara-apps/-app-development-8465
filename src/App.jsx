import React, { useState, useEffect } from 'react'
import { AppLayout } from './components/AppLayout'
import { Dashboard } from './components/Dashboard'
import { DreamJournal } from './components/DreamJournal'
import { AuthModal } from './components/AuthModal'
import { DreamContextProvider } from './context/DreamContext'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('dreamWeaver_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('dreamWeaver_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('dreamWeaver_user')
    localStorage.removeItem('dreamWeaver_dreams')
  }

  if (!isAuthenticated) {
    return <AuthModal onLogin={handleLogin} />
  }

  return (
    <DreamContextProvider>
      <AppLayout 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' && <Dashboard user={user} />}
        {currentView === 'journal' && <DreamJournal user={user} />}
      </AppLayout>
    </DreamContextProvider>
  )
}

export default App