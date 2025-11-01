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
      <a
        v-for="item in navItems"
        :key="item.id"
        href="#"
        class="nav-item"
        :class="{ 'active': activeNav === item.id }"
        @click.prevent="handleNavClick(item.id)"
        :title="item.label"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="item.icon"></svg>
        <span v-show="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </a>
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

      <div class="user-profile" v-if="!isCollapsed">
        <div class="user-avatar">JD</div>
        <div class="user-info">
          <div class="user-name">John Doe</div>
          <div class="user-email">john@example.com</div>
        </div>
      </div>
      <div class="user-avatar-only" v-else title="John Doe">
        <div class="user-avatar">JD</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isCollapsed: Boolean,
  isDark: Boolean
})

const emit = defineEmits(['toggle', 'toggle-theme', 'nav-change'])

const activeNav = ref('dashboard')

const navItems = ref([
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'
  },
  {
    id: 'users',
    label: 'Users',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
  }
])

const handleNavClick = (id) => {
  activeNav.value = id
  emit('nav-change', id)
}
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

.nav-item.active {
  background: var(--bg);
  color: var(--text-primary);
}

.nav-item.active::before {
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

.user-avatar-only {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.user-avatar-only:hover {
  background: var(--bg);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease;
}

.user-profile:hover {
  background: var(--bg);
  transform: translateY(-1px);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.813rem;
  font-weight: 600;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user-profile:hover .user-avatar {
  transform: scale(1.05);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
