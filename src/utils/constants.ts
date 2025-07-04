// ===== APPLICATION CONSTANTS =====

// Session statuses
export const SESSION_STATUS = {
  INSIDE: 'inside',
  OUTSIDE: 'outside'
} as const

// Entry actions
export const ENTRY_ACTIONS = {
  ENTER: 'enter',
  EXIT: 'exit'
} as const

// Bracelet statuses
export const BRACELET_STATUS = {
  AVAILABLE: 'available',
  ACTIVE: 'active',
  LOST: 'lost',
  BROKEN: 'broken'
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const

// Sound types
export const SOUND_TYPES = {
  ENTER: 'enter',
  EXIT: 'exit',
  NEW: 'new',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// Navigation tabs
export const NAVIGATION_TABS = {
  SCANNER: 'scanner',
  SESSIONS: 'sessions',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  ADMIN: 'admin'
} as const

// Product categories
export const PRODUCT_CATEGORIES = {
  DRINKS: 'drinks',
  SNACKS: 'snacks',
  EXTRAS: 'extras'
} as const

// Time constants
export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  MILLISECONDS_PER_MINUTE: 60000,
  MILLISECONDS_PER_HOUR: 3600000
} as const

// Duration thresholds (in minutes)
export const DURATION_THRESHOLDS = {
  SHORT: 60,      // 1 hour
  MEDIUM: 180,    // 3 hours
  LONG: 300       // 5 hours
} as const

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  REFRESH_INTERVAL: 30000,
  CONFETTI_COUNT: 50,
  VIBRATION_PATTERNS: {
    ENTER: [100, 50, 100],
    EXIT: [200],
    SUCCESS: [50, 50, 50, 50, 50],
    ERROR: [500]
  }
} as const

// Messages
export const MESSAGES = {
  SUCCESS: {
    REGISTRATION: '🎉 Bracelet registered successfully!',
    ENTRY: '🎪 {name} has entered the play area!',
    EXIT: '🎪 {name} has exited the play area!',
    SESSION_ENDED: '✅ Session ended successfully!'
  },
  ERROR: {
    SCAN_FAILED: '❌ Error processing bracelet',
    REGISTRATION_FAILED: 'Registration failed',
    LOADING_FAILED: 'Failed to load data',
    NETWORK_ERROR: 'Network error occurred',
    INVALID_BRACELET: 'Invalid bracelet code'
  },
  WARNING: {
    OVERTIME: 'Session time exceeded',
    LOW_BATTERY: 'Device battery low',
    LOST_CONNECTION: 'Connection lost'
  },
  INFO: {
    LOADING: 'Loading...',
    SCANNING: 'Scanning for bracelet...',
    PROCESSING: 'Processing...'
  }
} as const

// API Endpoints (if needed for future expansion)
export const API_ENDPOINTS = {
  SESSIONS: '/api/sessions',
  BRACELETS: '/api/bracelets',
  PARENTS: '/api/parents',
  CHILDREN: '/api/children',
  TARIFFS: '/api/tariffs',
  ANALYTICS: '/api/analytics'
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'gl_pos_theme',
  SETTINGS: 'gl_pos_settings',
  CACHE: 'gl_pos_cache',
  OFFLINE_DATA: 'gl_pos_offline'
} as const

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR'
} as const

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
} as const

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1200
} as const

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#FFD700',
  SECONDARY: '#9966ff',
  SUCCESS: '#00cc66',
  WARNING: '#FFA500',
  ERROR: '#ff4444',
  INFO: '#0066ff'
} as const

// Default values
export const DEFAULTS = {
  SEARCH_PLACEHOLDER: 'Search by name, phone, or bracelet code...',
  EMPTY_CHILD_NAME: 'Child',
  PAGINATION_SIZE: 20,
  CACHE_DURATION: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3
} as const

// Validation rules
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  BRACELET_CODE_LENGTH: 6,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[+]?[\d\s\-()]+$/
} as const

// Features flags (for future use)
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_SOUND: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_DARK_THEME: true,
  ENABLE_PWA: true
} as const

// Type helpers
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS]
export type EntryAction = typeof ENTRY_ACTIONS[keyof typeof ENTRY_ACTIONS]
export type BraceletStatus = typeof BRACELET_STATUS[keyof typeof BRACELET_STATUS]
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
export type SoundType = typeof SOUND_TYPES[keyof typeof SOUND_TYPES]
export type NavigationTab = typeof NAVIGATION_TABS[keyof typeof NAVIGATION_TABS]
export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES]
export type Theme = typeof THEME[keyof typeof THEME] 