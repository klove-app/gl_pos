import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react'

interface BranchStats {
  id: number
  name: string
  city: string
  todayRevenue: number
  monthRevenue: number
  todayVisitors: number
  monthVisitors: number
  currentlyInside: number
  avgSessionTime: number
  rating: number
  topTariff: string
  growth: number
}

const AdminPanel: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'month'>('today')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'visitors' | 'time'>('revenue')
  const [branches, setBranches] = useState<BranchStats[]>([])

  // Generate test data for 12 branches
  useEffect(() => {
    const branchNames = [
      { name: 'Gymboland Central', city: 'Bucharest' },
      { name: 'Gymboland North', city: 'Cluj-Napoca' },
      { name: 'Gymboland West', city: 'Timișoara' },
      { name: 'Gymboland East', city: 'Iași' },
      { name: 'Gymboland South', city: 'Constanța' },
      { name: 'Gymboland Plaza', city: 'Brașov' },
      { name: 'Gymboland Mall', city: 'Galați' },
      { name: 'Gymboland Park', city: 'Craiova' },
      { name: 'Gymboland Center', city: 'Ploiești' },
      { name: 'Gymboland Kids', city: 'Oradea' },
      { name: 'Gymboland Fun', city: 'Arad' },
      { name: 'Gymboland Joy', city: 'Sibiu' }
    ]

    const mockBranches: BranchStats[] = branchNames.map((branch, index) => ({
      id: index + 1,
      name: branch.name,
      city: branch.city,
      todayRevenue: Math.floor(Math.random() * 3000) + 1500,
      monthRevenue: Math.floor(Math.random() * 80000) + 40000,
      todayVisitors: Math.floor(Math.random() * 50) + 20,
      monthVisitors: Math.floor(Math.random() * 1200) + 800,
      currentlyInside: Math.floor(Math.random() * 15) + 5,
              avgSessionTime: Math.floor(Math.random() * 180) + 90, // in minutes
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
              topTariff: ['2 Hours', '4 Hours', '1 Day'][Math.floor(Math.random() * 3)],
              growth: (Math.random() * 40 - 10) // from -10% to +30%
    }))

    setBranches(mockBranches)
  }, [])

      // Calculate total statistics
  const totalStats = branches.reduce((acc, branch) => ({
    todayRevenue: acc.todayRevenue + branch.todayRevenue,
    monthRevenue: acc.monthRevenue + branch.monthRevenue,
    todayVisitors: acc.todayVisitors + branch.todayVisitors,
    monthVisitors: acc.monthVisitors + branch.monthVisitors,
    currentlyInside: acc.currentlyInside + branch.currentlyInside,
    avgRating: acc.avgRating + parseFloat(branch.rating.toString())
  }), {
    todayRevenue: 0,
    monthRevenue: 0,
    todayVisitors: 0,
    monthVisitors: 0,
    currentlyInside: 0,
    avgRating: 0
  })

  totalStats.avgRating = totalStats.avgRating / branches.length

  // Top branches
  const topBranches = [...branches]
    .sort((a, b) => {
      if (selectedMetric === 'revenue') {
        return selectedPeriod === 'today' 
          ? b.todayRevenue - a.todayRevenue
          : b.monthRevenue - a.monthRevenue
      } else if (selectedMetric === 'visitors') {
        return selectedPeriod === 'today'
          ? b.todayVisitors - a.todayVisitors
          : b.monthVisitors - a.monthVisitors
      } else {
        return b.avgSessionTime - a.avgSessionTime
      }
    })
    .slice(0, 5)

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="admin-panel">
      {/* Header with toggles */}
      <div className="admin-header">
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('today')}
          >
            <Calendar size={16} />
            Today
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            <BarChart3 size={16} />
            Month
          </button>
        </div>

        <div className="metric-selector">
          <button 
            className={`metric-btn ${selectedMetric === 'revenue' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('revenue')}
          >
            <DollarSign size={16} />
            Revenue
          </button>
          <button 
            className={`metric-btn ${selectedMetric === 'visitors' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('visitors')}
          >
            <Users size={16} />
            Visitors
          </button>
          <button 
            className={`metric-btn ${selectedMetric === 'time' ? 'active' : ''}`}
            onClick={() => setSelectedMetric('time')}
          >
            <Clock size={16} />
            Time
          </button>
        </div>
      </div>

      {/* Total statistics */}
      <div className="total-stats">
        <div className="stat-card total-revenue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(selectedPeriod === 'today' ? totalStats.todayRevenue : totalStats.monthRevenue)}
            </div>
            <div className="stat-label">
              Total Revenue {selectedPeriod === 'today' ? 'Today' : 'This Month'}
            </div>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            +12.5%
          </div>
        </div>

        <div className="stat-card total-visitors">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {(selectedPeriod === 'today' ? totalStats.todayVisitors : totalStats.monthVisitors).toLocaleString()}
            </div>
            <div className="stat-label">
              Visitors {selectedPeriod === 'today' ? 'Today' : 'This Month'}
            </div>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            +8.3%
          </div>
        </div>

        <div className="stat-card currently-inside">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalStats.currentlyInside}</div>
            <div className="stat-label">Currently Inside</div>
          </div>
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            LIVE
          </div>
        </div>

        <div className="stat-card avg-rating">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalStats.avgRating.toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={`star ${star <= Math.round(totalStats.avgRating) ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top branches */}
      <div className="top-branches">
        <div className="section-header">
          <h3>
            <Award size={20} />
            Top Branches by {selectedMetric === 'revenue' ? 'Revenue' : selectedMetric === 'visitors' ? 'Visitors' : 'Session Time'}
          </h3>
        </div>
        
        <div className="branches-ranking">
          {topBranches.map((branch, index) => (
            <div key={branch.id} className={`branch-rank-card rank-${index + 1}`}>
              <div className="rank-badge">
                <span className="rank-number">#{index + 1}</span>
                {index === 0 && <span className="crown">👑</span>}
              </div>
              
              <div className="branch-info">
                <div className="branch-name">{branch.name}</div>
                <div className="branch-city">
                  <MapPin size={12} />
                  {branch.city}
                </div>
              </div>
              
              <div className="branch-metric">
                <div className="metric-value">
                  {selectedMetric === 'revenue' 
                    ? formatCurrency(selectedPeriod === 'today' ? branch.todayRevenue : branch.monthRevenue)
                    : selectedMetric === 'visitors'
                    ? (selectedPeriod === 'today' ? branch.todayVisitors : branch.monthVisitors).toLocaleString()
                    : formatTime(branch.avgSessionTime)
                  }
                </div>
                <div className={`growth ${branch.growth >= 0 ? 'positive' : 'negative'}`}>
                  {branch.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(branch.growth).toFixed(1)}%
                </div>
              </div>
              
              <div className="branch-status">
                <div className="currently-inside">
                  <Activity size={14} />
                  {branch.currentlyInside}
                </div>
                <div className="rating">
                  <Star size={14} />
                  {branch.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed table of all branches */}
      <div className="branches-table">
        <div className="section-header">
          <h3>
            <Target size={20} />
            All Branches - Detailed Statistics
          </h3>
        </div>
        
        <div className="table-container">
          <table className="branches-data-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>City</th>
                <th>Today Revenue</th>
                <th>Month Revenue</th>
                <th>Today Visitors</th>
                <th>Month Visitors</th>
                <th>Currently Inside</th>
                <th>Avg Time</th>
                <th>Rating</th>
                <th>Top Tariff</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {branches.map(branch => (
                <tr key={branch.id} className="branch-row">
                  <td className="branch-name-cell">
                    <div className="branch-name">{branch.name}</div>
                  </td>
                  <td className="city-cell">
                    <MapPin size={14} />
                    {branch.city}
                  </td>
                  <td className="revenue-cell">{formatCurrency(branch.todayRevenue)}</td>
                  <td className="revenue-cell">{formatCurrency(branch.monthRevenue)}</td>
                  <td className="visitors-cell">{branch.todayVisitors}</td>
                  <td className="visitors-cell">{branch.monthVisitors.toLocaleString()}</td>
                  <td className="inside-cell">
                    <div className="inside-badge">
                      <Activity size={12} />
                      {branch.currentlyInside}
                    </div>
                  </td>
                  <td className="time-cell">{formatTime(branch.avgSessionTime)}</td>
                  <td className="rating-cell">
                    <div className="rating-badge">
                      <Star size={12} />
                      {branch.rating}
                    </div>
                  </td>
                  <td className="tariff-cell">{branch.topTariff}</td>
                  <td className="growth-cell">
                    <div className={`growth-badge ${branch.growth >= 0 ? 'positive' : 'negative'}`}>
                      {branch.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(branch.growth).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions-admin">
        <div className="section-header">
          <h3>
            <Zap size={20} />
            Quick Actions
          </h3>
        </div>
        
        <div className="action-buttons-grid">
          <button className="action-btn export">
            <BarChart3 size={20} />
            Export Report
          </button>
          <button className="action-btn broadcast">
            <Activity size={20} />
            Send Notifications
          </button>
          <button className="action-btn settings">
            <Target size={20} />
            Branch Settings
          </button>
          <button className="action-btn analytics">
            <PieChart size={20} />
            Advanced Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel 