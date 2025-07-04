import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'pink' | 'yellow' | 'red' | 'gray'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  onClick?: () => void
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'blue',
  size = 'medium',
  loading = false,
  onClick,
  className = ''
}) => {
  const sizeClasses = {
    small: 'stat-card-small',
    medium: 'stat-card-medium',
    large: 'stat-card-large'
  }

  const colorClasses = {
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    orange: 'stat-card-orange',
    purple: 'stat-card-purple',
    cyan: 'stat-card-cyan',
    pink: 'stat-card-pink',
    yellow: 'stat-card-yellow',
    red: 'stat-card-red',
    gray: 'stat-card-gray'
  }

  const classes = [
    'stat-card',
    sizeClasses[size],
    colorClasses[color],
    loading ? 'stat-card-loading' : '',
    onClick ? 'stat-card-clickable' : '',
    className
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    if (onClick && !loading) {
      onClick()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && !loading && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div 
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      {...(onClick && { role: 'button' })}
    >
      {/* Loading state */}
      {loading && (
        <div className="stat-card-loading-overlay">
          <div className="stat-card-skeleton"></div>
        </div>
      )}

      {/* Card content */}
      <div className="stat-card-content">
        {/* Header with icon and trend */}
        <div className="stat-card-header">
          {icon && (
            <div className="stat-card-icon">
              {icon}
            </div>
          )}
          
          {trend && (
            <div className={`stat-card-trend ${trend.isPositive ? 'trend-positive' : 'trend-negative'}`}>
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="trend-value">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="trend-label">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="stat-card-main">
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value">
            {loading ? '...' : value}
          </div>
          {subtitle && (
            <p className="stat-card-subtitle">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Specialized stat card components
export const RevenueCard: React.FC<{ value: number; trend?: StatCardProps['trend'] }> = ({ 
  value, 
  trend 
}) => (
  <StatCard
    title="Revenue"
    value={`$${value.toFixed(2)}`}
    color="green"
    trend={trend}
    icon={<span>💰</span>}
  />
)

export const VisitorCard: React.FC<{ value: number; trend?: StatCardProps['trend'] }> = ({ 
  value, 
  trend 
}) => (
  <StatCard
    title="Visitors"
    value={value}
    color="blue"
    trend={trend}
    icon={<span>👥</span>}
  />
)

export const ActiveCard: React.FC<{ value: number; total: number }> = ({ 
  value, 
  total 
}) => (
  <StatCard
    title="Currently Inside"
    value={value}
    subtitle={`of ${total} total`}
    color="orange"
    icon={<span>🎮</span>}
  />
)

export const TimeCard: React.FC<{ value: string; subtitle?: string }> = ({ 
  value, 
  subtitle 
}) => (
  <StatCard
    title="Average Time"
    value={value}
    subtitle={subtitle}
    color="purple"
    icon={<span>⏱️</span>}
  />
)

export default StatCard 