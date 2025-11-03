<template>
  <div class="app-layout" :class="{ 'dark': isDark, 'sidebar-collapsed': isSidebarCollapsed }">
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      :is-dark="isDark"
      @toggle="toggleSidebar"
      @toggle-theme="toggleTheme"
    />

    <main class="main-content">
      <slot />
    </main>

    <!-- Global Emergency Alert Stop Button -->
    <button v-if="isAlertPlaying" @click="stopEmergencyAlert" class="floating-stop-alert">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16"/>
        <rect x="14" y="4" width="4" height="16"/>
      </svg>
      <span>Stop Emergency Alert</span>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '~/stores/settings'
import { useEmergencyAnalytics } from '~/composables/useEmergencyAudio'
import Sidebar from '~/components/Sidebar.vue'

const settingsStore = useSettingsStore()

// Import emergency analytics composable for global alert control
const { isAlertPlaying, stopAlert } = useEmergencyAnalytics()

// Use computed properties from store
const isSidebarCollapsed = computed(() => settingsStore.sidebarCollapsed)
const isDark = computed(() => settingsStore.theme === 'dark')

const toggleSidebar = async () => {
  await settingsStore.toggleSidebar()
}

const toggleTheme = async () => {
  await settingsStore.setTheme(isDark.value ? 'light' : 'dark')
}

const stopEmergencyAlert = () => {
  stopAlert()
}

// Load settings from JSON database
onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-layout.sidebar-collapsed .main-content {
  margin-left: 64px;
}

.floating-stop-alert {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4), 0 0 0 0 rgba(220, 38, 38, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
  animation: pulseFloat 2s ease-in-out infinite;
}

.floating-stop-alert:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(220, 38, 38, 0.5);
}

.floating-stop-alert:active {
  transform: translateY(0);
}

.floating-stop-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.floating-stop-alert span {
  white-space: nowrap;
}

@keyframes pulseFloat {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4), 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4), 0 0 0 12px rgba(220, 38, 38, 0);
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .floating-stop-alert {
    bottom: 1rem;
    right: 1rem;
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }

  .floating-stop-alert span {
    display: none;
  }

  .floating-stop-alert {
    border-radius: 50%;
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
  }
}
</style>
