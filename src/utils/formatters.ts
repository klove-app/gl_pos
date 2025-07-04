import { TIME_CONSTANTS, DURATION_THRESHOLDS } from './constants'

// ===== DATE & TIME FORMATTERS =====

/**
 * Format duration from start time to now
 */
export const formatDuration = (startTime: string): string => {
  const start = new Date(startTime)
  const now = new Date()
  const durationMs = now.getTime() - start.getTime()
  const minutes = Math.floor(durationMs / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE)
  
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / TIME_CONSTANTS.MINUTES_PER_HOUR)
  const remainingMinutes = minutes % TIME_CONSTANTS.MINUTES_PER_HOUR
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Format time from ISO string to HH:MM
 */
export const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Format date from ISO string to DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format datetime from ISO string to DD/MM HH:MM
 */
export const formatDateTime = (dateTimeString: string): string => {
  return `${formatDate(dateTimeString)} ${formatTime(dateTimeString)}`
}

/**
 * Get relative time (e.g., "2 hours ago", "5 minutes ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE)
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  
  const diffHours = Math.floor(diffMinutes / TIME_CONSTANTS.MINUTES_PER_HOUR)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return formatDate(dateString)
}

// ===== CURRENCY FORMATTERS =====

/**
 * Format currency with symbol
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format price without currency symbol
 */
export const formatPrice = (amount: number): string => {
  return amount.toFixed(2)
}

// ===== PHONE FORMATTERS =====

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')
  }
  
  return phone
}

/**
 * Clean phone number (remove formatting)
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

// ===== STRING FORMATTERS =====

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format name (capitalize each word)
 */
export const formatName = (name: string): string => {
  return name
    .split(' ')
    .map(word => capitalize(word.trim()))
    .filter(word => word.length > 0)
    .join(' ')
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Format bracelet code (uppercase and add dashes)
 */
export const formatBraceletCode = (code: string): string => {
  const cleaned = code.replace(/\W/g, '').toUpperCase()
  return cleaned.replace(/(.{2})/g, '$1-').replace(/-$/, '')
}

// ===== DURATION HELPERS =====

/**
 * Get duration color class based on time spent
 */
export const getDurationColor = (startTime: string): string => {
  const start = new Date(startTime)
  const now = new Date()
  const minutes = Math.floor((now.getTime() - start.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE)
  
  if (minutes < DURATION_THRESHOLDS.SHORT) return 'duration-short'
  if (minutes < DURATION_THRESHOLDS.MEDIUM) return 'duration-medium'
  return 'duration-long'
}

/**
 * Check if session is overtime
 */
export const isOvertime = (startTime: string, durationHours: number): boolean => {
  const start = new Date(startTime)
  const now = new Date()
  const actualHours = (now.getTime() - start.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_HOUR
  return actualHours > durationHours
}

/**
 * Calculate overtime amount
 */
export const calculateOvertime = (startTime: string, durationHours: number): number => {
  const start = new Date(startTime)
  const now = new Date()
  const actualHours = (now.getTime() - start.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_HOUR
  return Math.max(0, actualHours - durationHours)
}

// ===== NUMBER FORMATTERS =====

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1)}%`
}

// ===== MESSAGE FORMATTERS =====

/**
 * Replace placeholders in message templates
 */
export const formatMessage = (template: string, values: Record<string, string>): string => {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return values[key] || match
  })
}

/**
 * Format child name with fallback
 */
export const formatChildName = (name: string | undefined): string => {
  return name?.trim() || 'Child'
}

// ===== VALIDATION HELPERS =====

/**
 * Check if string is valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if string is valid phone
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = cleanPhone(phone)
  return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Check if bracelet code is valid format
 */
export const isValidBraceletCode = (code: string): boolean => {
  const cleaned = code.replace(/\W/g, '')
  return cleaned.length >= 4 && cleaned.length <= 20
}

// ===== ARRAY HELPERS =====

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Sort array by multiple keys
 */
export const sortBy = <T>(array: T[], ...keys: (keyof T)[]): T[] => {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return -1
      if (aVal > bVal) return 1
    }
    return 0
  })
}

// ===== SEARCH HELPERS =====

/**
 * Normalize search query
 */
export const normalizeSearchQuery = (query: string): string => {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Check if text matches search query
 */
export const matchesSearch = (text: string, query: string): boolean => {
  const normalizedText = normalizeSearchQuery(text)
  const normalizedQuery = normalizeSearchQuery(query)
  return normalizedText.includes(normalizedQuery)
} 