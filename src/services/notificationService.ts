import toast from 'react-hot-toast'
import { NOTIFICATION_TYPES, MESSAGES, UI_CONSTANTS, FEATURES } from '../utils/constants'
import type { NotificationType } from '../utils/constants'
import { formatMessage } from '../utils/formatters'

export interface NotificationOptions {
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  style?: React.CSSProperties
  className?: string
  icon?: string
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
  timestamp: string
  read: boolean
  data?: Record<string, unknown>
}

class NotificationService {
  private notifications: AppNotification[] = []
  private listeners: Array<(notifications: AppNotification[]) => void> = []
  private enabled = true

  constructor() {
    this.enabled = FEATURES.ENABLE_NOTIFICATIONS
  }

  /**
   * Show a toast notification
   */
  showToast(
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ): string {
    if (!this.enabled) return ''

    const {
      duration = UI_CONSTANTS.ANIMATION_DURATION * 10,
      icon,
      dismissible = true,
      action
    } = options

    const toastOptions = {
      duration,
      position: options.position,
      style: {
        background: this.getToastBackground(type),
        color: this.getToastColor(),
        ...options.style
      },
      className: options.className,
      icon: icon || this.getDefaultIcon(type)
    }

    let toastId: string

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        toastId = toast.success(message, toastOptions)
        break
      case NOTIFICATION_TYPES.ERROR:
        toastId = toast.error(message, toastOptions)
        break
      case NOTIFICATION_TYPES.WARNING:
        toastId = toast(message, { ...toastOptions, icon: '⚠️' })
        break
      case NOTIFICATION_TYPES.INFO:
        toastId = toast(message, { ...toastOptions, icon: 'ℹ️' })
        break
      default:
        toastId = toast(message, toastOptions)
    }

    // Add action button if provided (would need to be implemented in a React component)
    if (action && dismissible) {
      // This would be handled by a custom toast component
      console.log('Action button requested:', action.label)
    }

    return toastId
  }

  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions): string {
    return this.showToast(NOTIFICATION_TYPES.SUCCESS, message, options)
  }

  /**
   * Show error notification
   */
  error(message: string, options?: NotificationOptions): string {
    return this.showToast(NOTIFICATION_TYPES.ERROR, message, options)
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions): string {
    return this.showToast(NOTIFICATION_TYPES.WARNING, message, options)
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions): string {
    return this.showToast(NOTIFICATION_TYPES.INFO, message, options)
  }

  /**
   * Show loading notification
   */
  loading(message: string): string {
    return toast.loading(message)
  }

  /**
   * Update existing toast
   */
  updateToast(toastId: string, type: NotificationType, message: string): void {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        toast.success(message, { id: toastId })
        break
      case NOTIFICATION_TYPES.ERROR:
        toast.error(message, { id: toastId })
        break
      default:
        toast(message, { id: toastId })
    }
  }

  /**
   * Dismiss specific toast
   */
  dismiss(toastId: string): void {
    toast.dismiss(toastId)
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    toast.dismiss()
  }

  /**
   * Add persistent notification
   */
  addNotification(
    type: NotificationType,
    message: string,
    data?: Record<string, unknown>
  ): AppNotification {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      data
    }

    this.notifications.unshift(notification)
    this.notifyListeners()

    return notification
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.notifyListeners()
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = []
    this.notifyListeners()
  }

  /**
   * Get all notifications
   */
  getNotifications(): AppNotification[] {
    return [...this.notifications]
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): AppNotification[] {
    return this.notifications.filter(n => !n.read)
  }

  /**
   * Get notification count
   */
  getUnreadCount(): number {
    return this.getUnreadNotifications().length
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: AppNotification[]) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Show predefined message
   */
  showMessage(
    messageKey: keyof typeof MESSAGES.SUCCESS | keyof typeof MESSAGES.ERROR | keyof typeof MESSAGES.WARNING | keyof typeof MESSAGES.INFO,
    type: NotificationType,
    values?: Record<string, string>,
    options?: NotificationOptions
  ): string {
    const messageGroup = MESSAGES[type.toUpperCase() as keyof typeof MESSAGES] as Record<string, string>
    const template = messageGroup[messageKey]
    
    if (!template) {
      console.warn(`Message not found: ${type}.${messageKey}`)
      return ''
    }

    const message = values ? formatMessage(template, values) : template
    return this.showToast(type, message, options)
  }

  /**
   * Show entry notification
   */
  showEntryNotification(childName: string, action: 'enter' | 'exit'): string {
    const messageKey = action === 'enter' ? 'ENTRY' : 'EXIT'
    return this.showMessage(
      messageKey,
      NOTIFICATION_TYPES.SUCCESS,
      { name: childName },
      { duration: 5000 }
    )
  }

  /**
   * Show registration success
   */
  showRegistrationSuccess(): string {
    return this.showMessage(
      'REGISTRATION',
      NOTIFICATION_TYPES.SUCCESS,
      undefined,
      { duration: 3000 }
    )
  }

  /**
   * Show error with retry action
   */
  showErrorWithRetry(message: string, onRetry: () => void): string {
    return this.error(message, {
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: onRetry
      }
    })
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled && FEATURES.ENABLE_NOTIFICATIONS
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  private getToastBackground(type: NotificationType): string {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '#10B981'
      case NOTIFICATION_TYPES.ERROR:
        return '#EF4444'
      case NOTIFICATION_TYPES.WARNING:
        return '#F59E0B'
      case NOTIFICATION_TYPES.INFO:
        return '#3B82F6'
      default:
        return '#6B7280'
    }
  }

  private getToastColor(): string {
    return '#FFFFFF' // All notifications use white text
  }

  private getDefaultIcon(type: NotificationType): string {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅'
      case NOTIFICATION_TYPES.ERROR:
        return '❌'
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️'
      case NOTIFICATION_TYPES.INFO:
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications])
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })
  }
}

// Create singleton instance
export const notificationService = new NotificationService()

// Export class for testing
export { NotificationService }
export default notificationService 