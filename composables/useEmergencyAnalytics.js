import { ref, computed } from 'vue'

// ===================================
// GLOBAL AUDIO SYSTEM - SINGLETON
// ===================================

class EmergencyAudioManager {
  constructor() {
    this.audio = null
    this.isPlaying = ref(false)
    this.isManuallyStopped = ref(false)
    this.isReady = ref(false)
    this.isUnlocked = ref(false)

    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  initialize() {
    console.log('[AUDIO] Initializing emergency audio system...')

    // Create audio element
    this.audio = new Audio('/warning.mp3')
    this.audio.volume = 0.7
    this.audio.loop = true
    this.audio.preload = 'auto'

    // Event listeners
    this.audio.addEventListener('canplaythrough', () => {
      this.isReady.value = true
      console.log('[AUDIO] ✅ Audio file loaded and ready')
    }, { once: true })

    this.audio.addEventListener('playing', () => {
      this.isPlaying.value = true
      console.log('[AUDIO] ▶️  Playing')
    })

    this.audio.addEventListener('pause', () => {
      this.isPlaying.value = false
      console.log('[AUDIO] ⏸️  Paused')
    })

    this.audio.addEventListener('error', (e) => {
      console.error('[AUDIO] ❌ Load error:', e)
      console.error('[AUDIO] Make sure warning.mp3 exists in /public folder')
    })

    // Force load immediately
    this.audio.load()

    // Setup user interaction unlock
    this.setupUnlock()
  }

  setupUnlock() {
    const unlock = () => {
      if (!this.audio || this.isUnlocked.value) return

      console.log('[AUDIO] 🔓 Attempting unlock...')

      // Try to play and immediately pause to unlock
      const playPromise = this.audio.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.audio.pause()
            this.audio.currentTime = 0
            this.isUnlocked.value = true
            console.log('[AUDIO] ✅ Audio unlocked successfully')
          })
          .catch((err) => {
            console.log('[AUDIO] ⚠️  Unlock pending user interaction:', err.name)
          })
      }
    }

    // Try to unlock on various user interactions
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(eventName => {
      document.addEventListener(eventName, unlock, { once: true, passive: true })
    })

    // Also try unlock after a short delay
    setTimeout(unlock, 1000)
  }

  play() {
    if (!this.audio) {
      console.error('[AUDIO] ❌ Audio not initialized')
      return Promise.reject('Not initialized')
    }

    if (this.isPlaying.value) {
      console.log('[AUDIO] ⏩ Already playing')
      return Promise.resolve()
    }

    console.log('[AUDIO] 🎵 Starting playback...')

    const playPromise = this.audio.play()

    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          this.isManuallyStopped.value = false
          console.log('[AUDIO] ✅ Playback started successfully')
        })
        .catch((err) => {
          console.error('[AUDIO] ❌ Playback failed:', err.name, err.message)

          // Retry after short delay
          if (err.name === 'NotAllowedError') {
            console.log('[AUDIO] 🔄 Will retry on next user interaction')
          } else {
            setTimeout(() => {
              console.log('[AUDIO] 🔄 Retrying playback...')
              this.audio.play().catch(e => console.error('[AUDIO] ❌ Retry failed:', e))
            }, 500)
          }
        })
    }

    return Promise.resolve()
  }

  stop() {
    if (!this.audio) return

    console.log('[AUDIO] ⏹️  Stopping playback...')

    this.audio.pause()
    this.audio.currentTime = 0
    this.isManuallyStopped.value = true
    this.isPlaying.value = false

    console.log('[AUDIO] ✅ Stopped by user')
  }

  reset() {
    this.isManuallyStopped.value = false
  }
}

// Create global singleton instance
const audioManager = new EmergencyAudioManager()

export const useEmergencyAnalytics = () => {
  const emergencyModules = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const settings = ref(null)

  // Load settings
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success && data.settings) {
        settings.value = data.settings
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const fetchEmergencyModules = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Load settings first if not loaded
      if (!settings.value) {
        await loadSettings()
      }

      // Check if emergency triggers are enabled
      if (settings.value && !settings.value.enableEmergencyTriggers) {
        emergencyModules.value = []
        audioManager.stop()
        isLoading.value = false
        return
      }

      const response = await fetch('/api/modules')
      if (!response.ok) throw new Error('Failed to fetch modules')

      const data = await response.json()
      const modules = Array.isArray(data) ? data : (data.modules || [])

      // Filter only emergency modules
      const emergencies = modules.filter(m => m.status === 'emergency')

      console.log(`[EMERGENCY] Found ${emergencies.length} emergency modules`)

      // IMMEDIATE AUDIO TRIGGER
      const audioEnabled = settings.value?.enableAudioAlerts !== false

      if (emergencies.length > 0 && audioEnabled) {
        // Play audio if not manually stopped
        if (!audioManager.isManuallyStopped.value) {
          console.log('[EMERGENCY] 🚨 Emergency detected! Triggering audio...')
          audioManager.play()
        } else {
          console.log('[EMERGENCY] ⏸️  Emergency exists but audio manually stopped')
        }
      } else if (emergencies.length === 0) {
        // No emergencies - stop audio and reset
        if (audioManager.isPlaying.value) {
          console.log('[EMERGENCY] ✅ No emergencies - stopping audio')
          audioManager.stop()
          audioManager.reset()
        }
      }

      // Fetch latest sensor data for each emergency module (happens in background, doesn't block audio)
      const enrichedEmergencies = await Promise.all(
        emergencies.map(async (module) => {
          try {
            const sensorResponse = await fetch(`/api/sensor-data?umid=${module.umid}&limit=1`)
            if (sensorResponse.ok) {
              const sensorData = await sensorResponse.json()
              const latestData = Array.isArray(sensorData) ? sensorData[0] : sensorData.data?.[0]

              return {
                ...module,
                latestReading: latestData,
                triggeredConditions: getTriggeredConditions(module, latestData)
              }
            }
          } catch (err) {
            console.error(`Error fetching sensor data for ${module.umid}:`, err)
          }
          return module
        })
      )

      emergencyModules.value = enrichedEmergencies

    } catch (err) {
      console.error('[EMERGENCY] Error fetching modules:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const getTriggeredConditions = (module, reading) => {
    if (!module.triggers || !reading?.data) return []

    const triggered = []
    Object.entries(module.triggers).forEach(([field, config]) => {
      if (!config.enabled) return

      const value = reading.data[field]
      if (value === undefined) return

      const isTriggered = config.condition === 'above'
        ? value > config.threshold
        : value < config.threshold

      if (isTriggered) {
        triggered.push({
          field,
          value,
          threshold: config.threshold,
          condition: config.condition
        })
      }
    })
    return triggered
  }

  const stopAlert = () => {
    audioManager.stop()
  }

  const stats = computed(() => {
    return {
      totalEmergencies: emergencyModules.value.length,
      criticalAlerts: emergencyModules.value.filter(m =>
        m.triggeredConditions?.length > 1
      ).length,
      moduleTypes: [...new Set(emergencyModules.value.map(m => m.moduleType))].length
    }
  })

  return {
    emergencyModules,
    stats,
    isLoading,
    error,
    isAlertPlaying: audioManager.isPlaying,
    isAudioReady: audioManager.isReady,
    fetchEmergencyModules,
    stopAlert
  }
}
