import { useState, useEffect, useCallback } from 'react'
import { soundService } from '../services/soundService'
import type { SoundType } from '../utils/constants'

export interface UseSoundOptions {
  autoInitialize?: boolean
  enableVibration?: boolean
}

export interface UseSoundResult {
  // State
  isEnabled: boolean
  isInitialized: boolean
  audioContextState: string
  
  // Actions
  playSound: (type: SoundType) => Promise<void>
  playVibration: (type: SoundType) => void
  playNotification: (type: SoundType) => Promise<void>
  
  // Settings
  setEnabled: (enabled: boolean) => void
  initialize: () => Promise<void>
  testSound: () => Promise<boolean>
  
  // Status
  canPlaySounds: boolean
}

export const useSound = (options: UseSoundOptions = {}): UseSoundResult => {
  const {
    autoInitialize = true,
    enableVibration = true
  } = options

  // State
  const [isEnabled, setIsEnabled] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [audioContextState, setAudioContextState] = useState('unknown')

  // Initialize sound service
  const initialize = useCallback(async (): Promise<void> => {
    try {
      await soundService.initialize()
      setIsInitialized(true)
      setAudioContextState(soundService.getAudioContextState())
    } catch (error) {
      console.warn('Failed to initialize sound service:', error)
      setIsInitialized(false)
    }
  }, [])

  // Play sound
  const playSound = useCallback(async (type: SoundType): Promise<void> => {
    if (!isEnabled) return
    
    try {
      await soundService.playSound(type)
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }, [isEnabled])

  // Play vibration
  const playVibration = useCallback((type: SoundType): void => {
    if (!isEnabled || !enableVibration) return
    
    try {
      soundService.playVibration(type)
    } catch (error) {
      console.warn('Failed to play vibration:', error)
    }
  }, [isEnabled, enableVibration])

  // Play notification (sound + vibration)
  const playNotification = useCallback(async (type: SoundType): Promise<void> => {
    if (!isEnabled) return
    
    try {
      if (enableVibration) {
        await soundService.playNotification(type)
      } else {
        await soundService.playSound(type)
      }
    } catch (error) {
      console.warn('Failed to play notification:', error)
    }
  }, [isEnabled, enableVibration])

  // Enable/disable sounds
  const handleSetEnabled = useCallback((enabled: boolean): void => {
    setIsEnabled(enabled)
    soundService.setEnabled(enabled)
  }, [])

  // Test sound functionality
  const testSound = useCallback(async (): Promise<boolean> => {
    if (!isEnabled) return false
    
    try {
      return await soundService.testSound()
    } catch (error) {
      console.warn('Sound test failed:', error)
      return false
    }
  }, [isEnabled])

  // Initialize on mount (with user interaction)
  useEffect(() => {
    if (!autoInitialize) return

    // Initialize after user interaction (required for audio context)
    const handleUserInteraction = () => {
      initialize()
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }

    // Add listeners for user interaction
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [autoInitialize, initialize])

  // Update audio context state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = soundService.getAudioContextState()
      if (newState !== audioContextState) {
        setAudioContextState(newState)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [audioContextState])

  // Update enabled state from service
  useEffect(() => {
    setIsEnabled(soundService.isEnabled())
  }, [])

  // Computed values
  const canPlaySounds = isEnabled && isInitialized && audioContextState === 'running'

  return {
    // State
    isEnabled,
    isInitialized,
    audioContextState,
    
    // Actions
    playSound,
    playVibration,
    playNotification,
    
    // Settings
    setEnabled: handleSetEnabled,
    initialize,
    testSound,
    
    // Status
    canPlaySounds
  }
}

export default useSound 