import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'
import type { AppNotification, NotificationOptions } from '../services/notificationService'
import type { NotificationType } from '../utils/constants'

export interface UseNotificationsOptions {
  autoSubscribe?: boolean
  maxNotifications?: number
}

export interface UseNotificationsResult {
  // Data
  notifications: AppNotification[]
  unreadNotifications: AppNotification[]
  unreadCount: number
  
  // Actions
  showNotification: (type: NotificationType, message: string, options?: NotificationOptions) => string
  success: (message: string, options?: NotificationOptions) => string
  error: (message: string, options?: NotificationOptions) => string
  warning: (message: string, options?: NotificationOptions) => string
  info: (message: string, options?: NotificationOptions) => string
  loading: (message: string) => string
  
  // Toast management
  dismiss: (toastId: string) => void
  dismissAll: () => void
  updateToast: (toastId: string, type: NotificationType, message: string) => void
  
  // Persistent notifications
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAllNotifications: () => void
  
  // Predefined notifications
  showEntryNotification: (childName: string, action: 'enter' | 'exit') => string
  showRegistrationSuccess: () => string
  showErrorWithRetry: (message: string, onRetry: () => void) => string
  
  // Settings
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsResult => {
  const {
    autoSubscribe = true,
    maxNotifications = 50
  } = options

  // State
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  // Subscribe to notification changes
  useEffect(() => {
    if (!autoSubscribe) return

    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      // Limit notifications to prevent memory issues
      const limitedNotifications = updatedNotifications.slice(0, maxNotifications)
      setNotifications(limitedNotifications)
    })

    // Initial load
    setNotifications(notificationService.getNotifications().slice(0, maxNotifications))

    return unsubscribe
  }, [autoSubscribe, maxNotifications])

  // Toast notifications
  const showNotification = useCallback((
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ): string => {
    return notificationService.showToast(type, message, options)
  }, [])

  const success = useCallback((message: string, options?: NotificationOptions): string => {
    return notificationService.success(message, options)
  }, [])

  const error = useCallback((message: string, options?: NotificationOptions): string => {
    return notificationService.error(message, options)
  }, [])

  const warning = useCallback((message: string, options?: NotificationOptions): string => {
    return notificationService.warning(message, options)
  }, [])

  const info = useCallback((message: string, options?: NotificationOptions): string => {
    return notificationService.info(message, options)
  }, [])

  const loading = useCallback((message: string): string => {
    return notificationService.loading(message)
  }, [])

  // Toast management
  const dismiss = useCallback((toastId: string): void => {
    notificationService.dismiss(toastId)
  }, [])

  const dismissAll = useCallback((): void => {
    notificationService.dismissAll()
  }, [])

  const updateToast = useCallback((toastId: string, type: NotificationType, message: string): void => {
    notificationService.updateToast(toastId, type, message)
  }, [])

  // Persistent notifications
  const markAsRead = useCallback((notificationId: string): void => {
    notificationService.markAsRead(notificationId)
  }, [])

  const markAllAsRead = useCallback((): void => {
    notificationService.markAllAsRead()
  }, [])

  const removeNotification = useCallback((notificationId: string): void => {
    notificationService.removeNotification(notificationId)
  }, [])

  const clearAllNotifications = useCallback((): void => {
    notificationService.clearAll()
  }, [])

  // Predefined notifications
  const showEntryNotification = useCallback((childName: string, action: 'enter' | 'exit'): string => {
    return notificationService.showEntryNotification(childName, action)
  }, [])

  const showRegistrationSuccess = useCallback((): string => {
    return notificationService.showRegistrationSuccess()
  }, [])

  const showErrorWithRetry = useCallback((message: string, onRetry: () => void): string => {
    return notificationService.showErrorWithRetry(message, onRetry)
  }, [])

  // Settings
  const handleSetEnabled = useCallback((enabled: boolean): void => {
    setIsEnabled(enabled)
    notificationService.setEnabled(enabled)
  }, [])

  // Computed values
  const unreadNotifications = notifications.filter(n => !n.read)
  const unreadCount = unreadNotifications.length

  return {
    // Data
    notifications,
    unreadNotifications,
    unreadCount,
    
    // Actions
    showNotification,
    success,
    error,
    warning,
    info,
    loading,
    
    // Toast management
    dismiss,
    dismissAll,
    updateToast,
    
    // Persistent notifications
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Predefined notifications
    showEntryNotification,
    showRegistrationSuccess,
    showErrorWithRetry,
    
    // Settings
    isEnabled,
    setEnabled: handleSetEnabled
  }
}

export default useNotifications 