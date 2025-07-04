import { useState, useEffect, useCallback } from 'react'
import { BraceletAPI } from '../lib/api'
import type { SessionWithDetails } from '../types'
import { notificationService } from '../services/notificationService'
import { soundService } from '../services/soundService'
import { SOUND_TYPES, MESSAGES } from '../utils/constants'
import { formatMessage, formatChildName } from '../utils/formatters'

export interface UseSessionOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseSessionResult {
  // Data
  sessions: SessionWithDetails[]
  filteredSessions: SessionWithDetails[]
  loading: boolean
  error: string | null
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Actions
  loadSessions: () => Promise<void>
  refreshSessions: () => Promise<void>
  handleScan: (code: string) => Promise<{ action: string; session: SessionWithDetails | null }>
  endSession: (sessionId: string) => Promise<void>
  
  // Statistics
  insideCount: number
  totalCount: number
}

export const useSession = (options: UseSessionOptions = {}): UseSessionResult => {
  const {
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  // State
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [filteredSessions, setFilteredSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Load sessions from API
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await BraceletAPI.getActiveSessions()
      setSessions(data)
      
      // Apply current search filter
      if (searchQuery.trim()) {
        const results = await BraceletAPI.searchSessions(searchQuery)
        setFilteredSessions(results)
      } else {
        setFilteredSessions(data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions'
      setError(errorMessage)
      notificationService.error(errorMessage)
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  // Refresh sessions (with user feedback)
  const refreshSessions = useCallback(async () => {
    await loadSessions()
    notificationService.info('Sessions refreshed', { duration: 2000 })
  }, [loadSessions])

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredSessions(sessions)
      return
    }

    try {
      const results = await BraceletAPI.searchSessions(query)
      setFilteredSessions(results)
    } catch (err) {
      console.error('Search error:', err)
      setFilteredSessions([])
      notificationService.error('Search failed')
    }
  }, [sessions])

  // Handle QR code scanning
  const handleScan = useCallback(async (code: string) => {
    try {
      setLoading(true)
      
      // Check if there's an active session for this bracelet
      const existingSession = await BraceletAPI.getActiveSessionByBraceletCode(code)
      
      if (existingSession) {
        // Toggle entry/exit status
        const { action } = await BraceletAPI.toggleEntryStatus(existingSession.id)
        
        // Update sessions list
        await loadSessions()
        
        // Show notification with child name
        const childName = formatChildName(existingSession.child.name)
        const message = formatMessage(
          action === 'enter' ? MESSAGES.SUCCESS.ENTRY : MESSAGES.SUCCESS.EXIT,
          { name: childName }
        )
        
        notificationService.success(message, { duration: 5000 })
        
        // Play sound and vibration
        await soundService.playNotification(action === 'enter' ? SOUND_TYPES.ENTER : SOUND_TYPES.EXIT)
        
        return { action, session: existingSession }
      } else {
        // Bracelet not registered - show notification
        notificationService.warning('Bracelet not registered. Please register first.', {
          duration: 5000
        })
        
        await soundService.playNotification(SOUND_TYPES.NEW)
        
        return { action: 'new', session: null }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error processing bracelet'
      setError(errorMessage)
      notificationService.error(errorMessage)
      
      await soundService.playNotification(SOUND_TYPES.ERROR)
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadSessions])

  // End session
  const endSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true)
      
      await BraceletAPI.endSession(sessionId)
      await loadSessions()
      
      notificationService.success(MESSAGES.SUCCESS.SESSION_ENDED)
      await soundService.playNotification(SOUND_TYPES.SUCCESS)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session'
      setError(errorMessage)
      notificationService.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadSessions])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadSessions()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadSessions])

  // Initial load
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Update search effect
  useEffect(() => {
    handleSearch(searchQuery)
  }, [searchQuery, handleSearch])

  // Statistics
  const insideCount = filteredSessions.filter(s => s.status === 'inside').length
  const totalCount = filteredSessions.length

  return {
    // Data
    sessions,
    filteredSessions,
    loading,
    error,
    
    // Search
    searchQuery,
    setSearchQuery: handleSearch,
    
    // Actions
    loadSessions,
    refreshSessions,
    handleScan,
    endSession,
    
    // Statistics
    insideCount,
    totalCount
  }
}

export default useSession 