import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'button'
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    danger: 'button-danger',
    success: 'button-success',
    warning: 'button-warning',
    outline: 'button-outline'
  }
  const sizeClasses = {
    small: 'button-small',
    medium: 'button-medium',
    large: 'button-large'
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'button-full-width' : '',
    loading ? 'button-loading' : '',
    disabled ? 'button-disabled' : '',
    className
  ].filter(Boolean).join(' ')

  const iconElement = loading ? <Loader2 size={16} className="spinner" /> : icon

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className="button-icon button-icon-left">
          {iconElement}
        </span>
      )}
      
      <span className="button-content">
        {children}
      </span>
      
      {iconElement && iconPosition === 'right' && (
        <span className="button-icon button-icon-right">
          {iconElement}
        </span>
      )}
    </button>
  )
}

export default Button 