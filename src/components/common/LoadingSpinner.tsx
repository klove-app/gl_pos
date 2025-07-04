import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  variant?: 'default' | 'dots' | 'pulse' | 'bars'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  message?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'default',
  color = 'primary',
  message,
  className = ''
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
    xlarge: 'spinner-xlarge'
  }

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white',
    gray: 'spinner-gray'
  }

  const baseClasses = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`${baseClasses} spinner-dots`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )

      case 'pulse':
        return (
          <div className={`${baseClasses} spinner-pulse`}>
            <div className="pulse-circle"></div>
          </div>
        )

      case 'bars':
        return (
          <div className={`${baseClasses} spinner-bars`}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        )

      default:
        return (
          <div className={`${baseClasses} spinner-default`}>
            <Loader2 className="spinner-icon" />
          </div>
        )
    }
  }

  return (
    <div className="loading-container">
      {renderSpinner()}
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
    </div>
  )
}

// Specialized spinner components
export const LoadingPage: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading-page">
    <LoadingSpinner size="large" message={message} />
  </div>
)

export const LoadingInline: React.FC<{ message?: string }> = ({ message }) => (
  <div className="loading-inline">
    <LoadingSpinner size="small" message={message} />
  </div>
)

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading-overlay">
    <div className="loading-overlay-content">
      <LoadingSpinner size="large" color="white" message={message} />
    </div>
  </div>
)

export const LoadingButton: React.FC<{ size?: LoadingSpinnerProps['size'] }> = ({ size = 'small' }) => (
  <LoadingSpinner size={size} variant="default" />
)

export default LoadingSpinner 