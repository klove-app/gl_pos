import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  RefreshCw,
  UserCheck,
  UserX,
  Timer,
  Calendar,
  DollarSign
} from 'lucide-react'
import type { SessionWithDetails } from '../types'
import AnalyticsCharts from './AnalyticsCharts'

interface DashboardProps {
  sessions: SessionWithDetails[]
  onRefresh: () => void
}

interface Stats {
  totalVisitors: number
  currentlyInside: number
  currentlyOutside: number
  totalRevenue: number
  averageSessionTime: number
  peakHour: string
  todayEntries: number
  todayExits: number
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onRefresh }) => {
  const [stats, setStats] = useState<Stats>({
    totalVisitors: 0,
    currentlyInside: 0,
    currentlyOutside: 0,
    totalRevenue: 0,
    averageSessionTime: 0,
    peakHour: '12:00',
    todayEntries: 0,
    todayExits: 0
  })
  const [loading, setLoading] = useState(false)

  // Calculate statistics
  const calculateStats = () => {
    const currentlyInside = sessions.filter(s => s.status === 'inside').length
    const currentlyOutside = sessions.filter(s => s.status === 'outside').length
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.tariff_plan?.price || 0), 0)
    
    // Average session duration
    const activeSessions = sessions.filter(s => s.start_time)
    const totalMinutes = activeSessions.reduce((sum, s) => {
      const start = new Date(s.start_time)
      const now = new Date()
      return sum + (now.getTime() - start.getTime()) / (1000 * 60)
    }, 0)
    const averageSessionTime = activeSessions.length > 0 ? totalMinutes / activeSessions.length : 0

    // Count entries/exits for today
    const today = new Date().toDateString()
    const todayEntries = sessions.reduce((count, s) => {
      return count + (s.entry_logs?.filter(log => 
        log.action === 'enter' && new Date(log.timestamp).toDateString() === today
      ).length || 0)
    }, 0)
    
    const todayExits = sessions.reduce((count, s) => {
      return count + (s.entry_logs?.filter(log => 
        log.action === 'exit' && new Date(log.timestamp).toDateString() === today
      ).length || 0)
    }, 0)

    setStats({
      totalVisitors: sessions.length,
      currentlyInside,
      currentlyOutside,
      totalRevenue,
      averageSessionTime,
      peakHour: '14:00', // Can be calculated from data
      todayEntries,
      todayExits
    })
  }

  const handleRefresh = async () => {
    setLoading(true)
    await onRefresh()
    setTimeout(() => setLoading(false), 500)
  }

  useEffect(() => {
    calculateStats()
  }, [sessions])

  const StatCard: React.FC<{
    icon: React.ReactNode
    title: string
    value: string | number
    subtitle?: string
    color: string
    trend?: 'up' | 'down'
  }> = ({ icon, title, value, subtitle, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
        {trend && (
          <div className={`trend-indicator ${trend}`}>
            <TrendingUp size={12} />
          </div>
        )}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value animated-number">{value}</div>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  )

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Analytics Dashboard</h2>
        <button 
          onClick={handleRefresh}
          className={`refresh-button ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

              {/* Main metrics */}
      <div className="stats-grid">
        <StatCard
          icon={<Users size={24} />}
          title="Total Visitors"
          value={stats.totalVisitors}
          subtitle="Active sessions"
          color="blue"
          trend="up"
        />
        
        <StatCard
          icon={<UserCheck size={24} />}
          title="Currently Inside"
          value={stats.currentlyInside}
          subtitle="Playing now"
          color="green"
        />
        
        <StatCard
          icon={<UserX size={24} />}
          title="Currently Outside"
          value={stats.currentlyOutside}
          subtitle="On break"
          color="orange"
        />
        
        <StatCard
          icon={<DollarSign size={24} />}
          title="Today's Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Total earnings"
          color="purple"
          trend="up"
        />
      </div>

              {/* Additional metrics */}
      <div className="secondary-stats">
        <StatCard
          icon={<Timer size={20} />}
          title="Avg. Session Time"
          value={formatTime(stats.averageSessionTime)}
          color="cyan"
        />
        
        <StatCard
          icon={<Activity size={20} />}
          title="Peak Hour"
          value={stats.peakHour}
          subtitle="Busiest time"
          color="pink"
        />
        
        <StatCard
          icon={<Calendar size={20} />}
          title="Today's Entries"
          value={stats.todayEntries}
          color="yellow"
        />
        
        <StatCard
          icon={<Clock size={20} />}
          title="Today's Exits"
          value={stats.todayExits}
          color="red"
        />
      </div>

              {/* Live activity */}
      <div className="activity-section">
        <h3>🔴 Live Activity</h3>
        <div className="activity-feed">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="activity-item">
              <div className={`activity-dot ${session.status}`}></div>
              <div className="activity-content">
                <span className="activity-name">
                  {session.child?.name || 'Child'} ({session.parent.name})
                </span>
                <span className="activity-status">
                  {session.status === 'inside' ? '🎪 Playing inside' : '🚪 Outside'}
                </span>
                <span className="activity-time">
                  {new Date(session.start_time).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

              {/* Quick actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-button export">
            📊 Export Data
          </button>
          <button className="action-button report">
            📈 Generate Report
          </button>
          <button className="action-button alert">
            🚨 Send Alert
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts sessions={sessions} />
    </div>
  )
}

export default Dashboard 