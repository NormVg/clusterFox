<template>
  <div class="dashboard" :class="{ 'dark': isDark, 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Sidebar Component -->
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      :is-dark="isDark"
      @toggle="toggleSidebar"
      @toggle-theme="toggleTheme"
    />

    <!-- Main Content -->
    <main class="main">
      <div class="main-container">
        <!-- Stats Grid -->
        <div class="stats">
          <StatCard label="Total Users" value="2,543" change="+12.5%" change-type="positive" />
          <StatCard label="Revenue" value="$45.2K" change="+8.2%" change-type="positive" />
          <StatCard label="Active Sessions" value="342" change="-2.4%" change-type="negative" />
          <StatCard label="Uptime" value="99.9%" change="+0.1%" change-type="positive" />
        </div>

        <!-- Content Grid -->
        <div class="grid">
          <ActivityCard />
          <SystemOverview />
          <QuickActions />
        </div>

        <!-- Data Logger (Full Width) -->
        <div class="full-width-section">
          <DataLogger />
        </div>

        <!-- Node Map (Full Width) -->
        <div class="full-width-section">
          <NodeMap
            @node-added="handleNodeAdded"
            @node-updated="handleNodeUpdated"
            @node-deleted="handleNodeDeleted"
            @node-selected="handleNodeSelected"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import StatCard from '~/components/StatCard.vue'
import ActivityCard from '~/components/ActivityCard.vue'
import SystemOverview from '~/components/SystemOverview.vue'
import QuickActions from '~/components/QuickActions.vue'
import DataLogger from '~/components/DataLogger.vue'
import NodeMap from '~/components/NodeMap.vue'

// Sidebar collapse state
const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value ? 'true' : 'false')
}

// Theme management
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Load theme and sidebar state from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark'

  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  isSidebarCollapsed.value = savedSidebarState === 'true'
})

// Node Map event handlers
const handleNodeAdded = (node) => {
  console.log('Node added:', node)
}

const handleNodeUpdated = (node) => {
  console.log('Node updated:', node)
}

const handleNodeDeleted = (node) => {
  console.log('Node deleted:', node)
}

const handleNodeSelected = (node) => {
  console.log('Node selected:', node)
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Custom Scrollbar - Light Mode */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* Custom Scrollbar - Dark Mode */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.dark * {
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}
</style>

<style scoped>

/* Theme Variables */
.dashboard {
  /* Reduced brightness light mode - easy on eyes */
  --bg: #e8e7e3;
  --surface: #f0efeb;
  --border: #d4d3cf;
  --text-primary: #1f1f1f;
  --text-secondary: #5a5a5a;
  --text-tertiary: #828282;
  --accent: #3a4553;
  --success: #0e9f6e;
  --warning: #d97706;
  --info: #2563eb;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 64px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text-primary);
  transition: all 0.2s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
}

.dashboard.dark {
  --bg: #0a0a0a;
  --surface: #121212;
  --border: #262626;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-tertiary: #737373;
  --accent: #ffffff;
}

/* Main Content */
.main {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 3rem 0;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100vh;
}

.sidebar-collapsed .main {
  margin-left: var(--sidebar-collapsed-width);
}

.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  overflow-x: hidden;
}

/* Stats Grid */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Content Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Full Width Section */
.full-width-section {
  width: 100%;
  margin-top: 2rem;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main {
    margin-left: 0;
    padding: 2rem 0;
    height: auto;
    min-height: 100vh;
  }

  .sidebar-collapsed .main {
    margin-left: 0;
  }

  .main-container {
    padding: 0 1rem;
    max-width: 100%;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

</style>
