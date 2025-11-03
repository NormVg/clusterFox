import { ref, computed } from 'vue'
import { useSound } from '@vueuse/sound'

// ===================================
// GLOBAL EMERGENCY AUDIO USING @vueuse/sound
// ===================================

let audioManagerInstance = null

export function useEmergencyAudio() {
  if (!audioManagerInstance) {
    audioManagerInstance = createEmergencyAudioManager()
  }
  return audioManagerInstance
}

function createEmergencyAudioManager() {
  const isPlaying = ref(false)
  const isManuallyStopped = ref(false)
  const currentEmergencies = ref([])
  const settings = ref({
    enableEmergencyTriggers: true,
    enableAudioAlerts: true
  })

  // Initialize @vueuse/sound with warning audio
  const { play: playSound, stop: stopSound, sound } = useSound('/warning.mp3', {
    volume: 0.7,
    loop: true,
    interrupt: true,
    onload: () => {
      console.log('[AUDIO] ✅ Audio file loaded via @vueuse/sound')
    },
    onloaderror: (id, error) => {
      console.error('[AUDIO] ❌ Load error:', error)
      console.error('[AUDIO] Make sure warning.mp3 exists in /public folder')
    },
    onplay: () => {
      isPlaying.value = true
      console.log('[AUDIO] ▶️  Playing via @vueuse/sound')
    },
    onstop: () => {
      isPlaying.value = false
      console.log('[AUDIO] ⏹️  Stopped')
    },
    onpause: () => {
      isPlaying.value = false
      console.log('[AUDIO] ⏸️  Paused')
    }
  })

  const play = () => {
    if (isPlaying.value) {
      console.log('[AUDIO] ⏩ Already playing')
      return
    }

    if (isManuallyStopped.value) {
      console.log('[AUDIO] 🛑 Manually stopped - ignoring auto-play')
      return
    }

    if (!settings.value.enableAudioAlerts) {
      console.log('[AUDIO] 🔇 Audio alerts disabled in settings')
      return
    }

    console.log('[AUDIO] 🔊 Starting emergency audio...')

    try {
      playSound()
    } catch (error) {
      console.error('[AUDIO] ❌ Play error:', error)
    }
  }

  const stop = () => {
    console.log('[AUDIO] 🛑 Stopping audio (manual)')
    isManuallyStopped.value = true

    try {
      stopSound()
    } catch (error) {
      console.error('[AUDIO] ❌ Stop error:', error)
    }
  }

  const reset = () => {
    console.log('[AUDIO] 🔄 Resetting manual stop flag')
    isManuallyStopped.value = false
  }

  return {
    isPlaying,
    isManuallyStopped,
    currentEmergencies,
    settings,
    play,
    stop,
    reset,
    sound // Expose Howl instance for advanced control
  }
}

// ===================================
// EMERGENCY ANALYTICS COMPOSABLE
// ===================================

export function useEmergencyAnalytics() {
  const audioManager = useEmergencyAudio()
  const emergencyModules = ref([])
  const isLoading = ref(false)

  const hasEmergencies = computed(() => {
    return emergencyModules.value.some(m => m.emergency?.isEmergency)
  })

  const emergencyCount = computed(() => {
    return emergencyModules.value.filter(m => m.emergency?.isEmergency).length
  })

  const fetchEmergencyModules = async () => {
    try {
      isLoading.value = true

      // Fetch settings
      const settingsRes = await fetch('/api/settings')
      const settingsData = await settingsRes.json()

      if (settingsData.success) {
        audioManager.settings.value = {
          enableEmergencyTriggers: settingsData.settings.enableEmergencyTriggers ?? true,
          enableAudioAlerts: settingsData.settings.enableAudioAlerts ?? true
        }
      }

      // Fetch modules
      const modulesRes = await fetch('/api/modules')
      const modulesData = await modulesRes.json()

      if (modulesData.success) {
        const modules = modulesData.modules || []

        // Filter emergency modules
        emergencyModules.value = modules.filter(m => m.emergency?.isEmergency)

        // Update audio state based on emergencies
        if (emergencyModules.value.length > 0) {
          // We have emergencies - play audio if not manually stopped
          if (!audioManager.isManuallyStopped.value &&
              audioManager.settings.value.enableEmergencyTriggers &&
              audioManager.settings.value.enableAudioAlerts) {
            audioManager.play()
          }
        } else {
          // No emergencies - stop audio and reset manual stop flag
          if (audioManager.isPlaying.value) {
            audioManager.stop()
          }
          // Reset manual stop when all emergencies are cleared
          if (audioManager.isManuallyStopped.value) {
            audioManager.reset()
          }
        }

        // Store current emergencies
        audioManager.currentEmergencies.value = emergencyModules.value
      }
    } catch (error) {
      console.error('[Emergency Analytics] Error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Start polling
  if (typeof window !== 'undefined') {
    fetchEmergencyModules()
    setInterval(fetchEmergencyModules, 2000) // Check every 2 seconds
  }

  return {
    emergencyModules,
    hasEmergencies,
    emergencyCount,
    isLoading,
    isAlertPlaying: audioManager.isPlaying,
    isManuallyStopped: audioManager.isManuallyStopped,
    stopAlert: audioManager.stop,
    settings: audioManager.settings
  }
}
