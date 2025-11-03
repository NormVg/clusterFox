<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-header">
      <h1 class="sidebar-logo" v-show="!isCollapsed">
        <span class="logo-text">cluster<span class="logo-light">fox</span></span>
      </h1>

      <button class="sidebar-toggle" @click="$emit('toggle')" aria-label="Toggle sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.id"
        :to="item.route"
        class="nav-item"
        :title="item.label"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="item.icon"></svg>
        <span v-show="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle" @click="$emit('toggle-theme')" aria-label="Toggle theme" :title="isDark ? 'Light Mode' : 'Dark Mode'">
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <span v-show="!isCollapsed">{{ isDark ? 'Light' : 'Dark' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  isCollapsed: Boolean,
  isDark: Boolean
})

const emit = defineEmits(['toggle', 'toggle-theme'])

const route = useRoute()

// Compute active route based on current URL
const currentRoute = computed(() => route.path)

const navItems = ref([
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
  },
  {
    id: 'modules',
    label: 'Modules',
    route: '/modules',
    icon: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    route: '/analytics',
    icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
  },
  {
    id: 'sensors',
    label: 'Sensor Data',
    route: '/sensors',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
  },
  {
    id: 'network',
    label: 'Network Map',
    route: '/network',
    icon: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>'
  },
  {
    id: 'cutoff-modules',
    label: 'Cutoff Modules',
    route: '/cutoff-modules',
    icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>'
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>'
  },
  {
    id: 'api-docs',
    label: 'API Docs',
    route: '/api-docs',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'
  }
])
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--surface);
  border-right: 1px solid var(--border);
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.sidebar-logo {
  margin: 0;
  overflow: hidden;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  display: inline-block;
  animation: fadeInSlide 0.4s ease;
}

.logo-light {
  font-weight: 300;
  color: var(--text-secondary);
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: var(--bg);
  color: var(--text-primary);
  transform: scale(1.05);
}

.sidebar-toggle:active {
  transform: scale(0.95);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 1rem 0.75rem;
}

.sidebar.collapsed .sidebar-toggle {
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.nav-item:hover {
  background: var(--bg);
  color: var(--text-primary);
  transform: translateX(2px);
}

.nav-item.active,
.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: var(--bg);
  color: var(--text-primary);
}

.nav-item.active::before,
.nav-item.router-link-active::before,
.nav-item.router-link-exact-active::before {
  height: 60%;
}

.nav-item svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-item:hover svg {
  transform: scale(1.1);
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.625rem;
}

.sidebar-footer {
  padding: 1rem 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theme-toggle {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--bg);
  transform: translateY(-1px);
}

.theme-toggle:active {
  transform: translateY(0);
}

.sidebar.collapsed .theme-toggle {
  justify-content: center;
  padding: 0;
}



@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease, width 0.3s ease;
  }
}
</style>
