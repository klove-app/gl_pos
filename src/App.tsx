import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Users, ScanLine, Plus, TrendingUp, Menu, Settings } from 'lucide-react'
import QrScanner from './components/QrScanner'
import SessionList from './components/SessionList'
import RegistrationForm from './components/RegistrationForm'
import SearchBar from './components/SearchBar'
import EmergencyActions from './components/EmergencyActions'
import Dashboard from './components/Dashboard'
import AdminPanel from './components/AdminPanel'
import { BraceletAPI } from './lib/api'
// For testing with mock data, uncomment the line below:
// import { MockBraceletAPI as BraceletAPI } from './lib/mockData'
import type { SessionWithDetails } from './types'
import './App.css'

type ActiveTab = 'scanner' | 'sessions' | 'register' | 'dashboard' | 'admin'

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions')
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [filteredSessions, setFilteredSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load active sessions
  const loadActiveSessions = async () => {
    try {
      setLoading(true)
      const data = await BraceletAPI.getActiveSessions()
      setSessions(data)
      setFilteredSessions(data)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search sessions
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredSessions(sessions)
      return
    }

    try {
      const results = await BraceletAPI.searchSessions(query)
      setFilteredSessions(results)
    } catch (error) {
      console.error('Search error:', error)
      setFilteredSessions([])
    }
  }

  // Handle QR code scanning
  const handleScan = async (code: string) => {
    try {
      setLoading(true)
      
              // Check if there's an active session for this bracelet
      const existingSession = await BraceletAPI.getActiveSessionByBraceletCode(code)
      
      if (existingSession) {
        // Toggle entry/exit status
        const { action } = await BraceletAPI.toggleEntryStatus(existingSession.id)
        
                  // Update sessions list
        await loadActiveSessions()
        
                  // Show notification with animation
        const actionText = action === 'enter' ? 'entered' : 'exited'
        const childName = existingSession.child.name || 'Child'
        
                  // Add sound effect
        playSound(action === 'enter' ? 'enter' : 'exit')
        
                  // Vibration on mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(action === 'enter' ? [100, 50, 100] : [200])
        }
        
        alert(`🎪 ${childName} has ${actionText} the play area!`)
              } else {
          // Bracelet not registered - go to registration
        setActiveTab('register')
        playSound('new')
      }
    } catch (error) {
      console.error('Scan error:', error)
      alert('❌ Error processing bracelet')
    } finally {
      setLoading(false)
    }
  }

  // Sound effects
  const playSound = (type: 'enter' | 'exit' | 'new' | 'success') => {
    // Create simple sounds with Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    switch (type) {
      case 'enter':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
        break
      case 'exit':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
        break
      case 'new':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2)
        break
      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2)
        break
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

        // Successful registration
  const handleRegistrationSuccess = () => {
    loadActiveSessions()
    setActiveTab('sessions')
    playSound('success')
    
          // Confetti effect
    createConfetti()
  }

      // Confetti animation
  const createConfetti = () => {
    const colors = ['#00cc66', '#0066ff', '#ffcc00', '#ff6699', '#9966ff', '#ff9933']
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.className = 'confetti'
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.left = Math.random() * 100 + '%'
        confetti.style.animationDelay = Math.random() * 2 + 's'
        document.body.appendChild(confetti)
        
        setTimeout(() => {
          confetti.remove()
        }, 3000)
      }, i * 20)
    }
  }

  useEffect(() => {
    loadActiveSessions()
  }, [])

  const insideCount = filteredSessions.filter(s => s.status === 'inside').length
  const totalCount = filteredSessions.length

  return (
    <div className="app">
      <Toaster position="top-center" />
      
      {/* Desktop Sidebar */}
      <aside className={`desktop-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-container">
              <img src="/images/gymboland-logo.png" alt="Gymboland" className="logo-image" />
            </div>
            <div className="client-name">
              Gymboland<span className="dot">•</span><span className="brand">e:corg</span>
            </div>
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="stat-card">
            <div className="stat-icon inside">
              <Users size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{insideCount}</span>
              <span className="stat-label">Inside</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <Users size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sessions')
              setSidebarOpen(false)
            }}
          >
            <Users size={20} />
            <span>Visitors</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('scanner')
              setSidebarOpen(false)
            }}
          >
            <ScanLine size={20} />
            <span>Scanner</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register')
              setSidebarOpen(false)
            }}
          >
            <Plus size={20} />
            <span>Register</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard')
              setSidebarOpen(false)
            }}
          >
            <TrendingUp size={20} />
            <span>Analytics</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin')
              setSidebarOpen(false)
            }}
          >
            <Settings size={20} />
            <span>Admin Panel</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Open menu"
        >
          <Menu size={24} />
        </button>
        <img src="/images/gymboland-logo.png" alt="Gymboland" className="mobile-logo" />
        <div className="header-stats">
          <span className="stat-badge inside">{insideCount}</span>
          <span className="stat-badge total">{totalCount}</span>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="main-content">
        {/* Desktop Header */}
        <div className="desktop-header">
          <div className="page-title">
            {activeTab === 'sessions' && 'Active Visitors'}
            {activeTab === 'scanner' && 'QR Scanner'}
            {activeTab === 'register' && 'Register New Visitor'}
            {activeTab === 'dashboard' && 'Analytics Dashboard'}
            {activeTab === 'admin' && 'Admin Panel - All Branches'}
          </div>
          
          <div className="header-center">
            {activeTab === 'sessions' && (
              <SearchBar 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by name, phone, or bracelet code..."
              />
            )}
          </div>
          
          <div className="developer-logo">
            <span className="ecorg-text">e:corg</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'scanner' && (
            <QrScanner 
              onScan={handleScan}
              loading={loading}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionList 
              sessions={filteredSessions}
              onRefresh={loadActiveSessions}
              loading={loading}
            />
          )}

          {activeTab === 'register' && (
            <RegistrationForm 
              onSuccess={handleRegistrationSuccess}
              onCancel={() => setActiveTab('sessions')}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              sessions={sessions}
              onRefresh={loadActiveSessions}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel />
          )}
        </div>
      </main>

      {/* Emergency Actions */}
      <EmergencyActions />

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`nav-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Users size={20} />
          <span>Visitors</span>
        </button>
        
        <button 
          className={`nav-button ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <ScanLine size={20} />
          <span>Scanner</span>
        </button>
        
        <button 
          className={`nav-button ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <Plus size={20} />
          <span>Register</span>
        </button>

        <button 
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <TrendingUp size={20} />
          <span>Analytics</span>
        </button>

        <button 
          className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <Settings size={20} />
          <span>Admin</span>
        </button>
      </nav>
    </div>
  )
}

export default App
