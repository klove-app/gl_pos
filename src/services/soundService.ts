import { SOUND_TYPES, UI_CONSTANTS, FEATURES } from '../utils/constants'
import type { SoundType } from '../utils/constants'

// Sound frequencies and durations for different types
const SOUND_CONFIG = {
  [SOUND_TYPES.ENTER]: {
    frequency: 800,
    endFrequency: 1200,
    duration: 0.1,
    type: 'sweep' as const
  },
  [SOUND_TYPES.EXIT]: {
    frequency: 600,
    endFrequency: 400,
    duration: 0.1,
    type: 'sweep' as const
  },
  [SOUND_TYPES.NEW]: {
    frequencies: [440, 554, 659],
    duration: 0.1,
    type: 'sequence' as const
  },
  [SOUND_TYPES.SUCCESS]: {
    frequencies: [523, 659, 784],
    duration: 0.1,
    type: 'sequence' as const
  },
  [SOUND_TYPES.ERROR]: {
    frequency: 200,
    duration: 0.3,
    type: 'single' as const
  }
}

class SoundService {
  private audioContext: AudioContext | null = null
  private enabled = true

  constructor() {
    this.enabled = FEATURES.ENABLE_SOUND
    this.initializeAudioContext()
  }

  private initializeAudioContext() {
    if (!this.enabled) return

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioContext = new AudioContextClass()
    } catch (error) {
      console.warn('AudioContext not supported:', error)
      this.enabled = false
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.enabled) return false

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
      } catch (error) {
        console.warn('Failed to resume audio context:', error)
        return false
      }
    }

    return true
  }

  /**
   * Play a sound by type
   */
  async playSound(type: SoundType): Promise<void> {
    if (!this.enabled || !await this.ensureAudioContext()) return

    const config = SOUND_CONFIG[type]
    if (!config) {
      console.warn(`Unknown sound type: ${type}`)
      return
    }

    try {
      switch (config.type) {
        case 'single':
          await this.playSingleTone(config.frequency, config.duration)
          break
        case 'sweep':
          await this.playSweepTone(config.frequency, config.endFrequency!, config.duration)
          break
        case 'sequence':
          await this.playSequenceTones(config.frequencies!, config.duration)
          break
      }
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  private async playSingleTone(frequency: number, duration: number): Promise<void> {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)

    return new Promise(resolve => {
      oscillator.onended = () => resolve()
    })
  }

  private async playSweepTone(startFreq: number, endFreq: number, duration: number): Promise<void> {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration)

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)

    return new Promise(resolve => {
      oscillator.onended = () => resolve()
    })
  }

  private async playSequenceTones(frequencies: number[], duration: number): Promise<void> {
    if (!this.audioContext) return

    for (let i = 0; i < frequencies.length; i++) {
      const delay = i * duration
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequencies[i], this.audioContext.currentTime + delay)
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + delay)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + duration)

      oscillator.start(this.audioContext.currentTime + delay)
      oscillator.stop(this.audioContext.currentTime + delay + duration)
    }

    return new Promise(resolve => {
      setTimeout(resolve, frequencies.length * duration * 1000)
    })
  }

  /**
   * Play vibration if supported
   */
  playVibration(type: SoundType): void {
    if (!navigator.vibrate) return

    const pattern = UI_CONSTANTS.VIBRATION_PATTERNS[type.toUpperCase() as keyof typeof UI_CONSTANTS.VIBRATION_PATTERNS]
    if (pattern) {
      navigator.vibrate(pattern)
    }
  }

  /**
   * Play both sound and vibration
   */
  async playNotification(type: SoundType): Promise<void> {
    await Promise.all([
      this.playSound(type),
      Promise.resolve(this.playVibration(type))
    ])
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled && FEATURES.ENABLE_SOUND
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Get audio context state
   */
  getAudioContextState(): string {
    return this.audioContext?.state || 'unavailable'
  }

  /**
   * Test sound functionality
   */
  async testSound(): Promise<boolean> {
    try {
      await this.playSound(SOUND_TYPES.SUCCESS)
      return true
    } catch {
      return false
    }
  }

  /**
   * Initialize audio context after user interaction
   */
  async initialize(): Promise<void> {
    if (!this.enabled) return

    try {
      if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        this.audioContext = new AudioContextClass()
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
      this.enabled = false
    }
  }
}

// Create singleton instance
export const soundService = new SoundService()

// Export class for testing
export { SoundService }
export default soundService 