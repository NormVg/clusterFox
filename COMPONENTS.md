# ClusterFox Dashboard - Component Structure

## 📁 Component Architecture

### Main Page: `pages/index.vue`
- Entry point for the dashboard
- Manages global state (theme, sidebar collapse)
- Composes all dashboard components
- Handles localStorage persistence

### Components Created:

#### 1. **Sidebar.vue** (`components/Sidebar.vue`)
**Features:**
- Collapsible sidebar (240px ↔ 64px)
- Navigation menu with 6 items
- Theme toggle button
- User profile display
- Active state tracking
**Animations:**
- Smooth width transitions (cubic-bezier easing)
- Hover scale effects on toggle button
- Active indicator bar animation
- Icon scale on hover
- Fade-in animations for logo and profile

#### 2. **StatCard.vue** (`components/StatCard.vue`)
**Features:**
- Displays metric label, value, and change percentage
- Color-coded change indicators (green/yellow)
- Hover effects
**Animations:**
- Slide-in-up entrance animation
- Lift effect on hover (translateY)
- Value scale animation on hover
- Change indicator slide on hover
- Staggered delays for multiple cards

#### 3. **ActivityCard.vue** (`components/ActivityCard.vue`)
**Features:**
- Recent activity feed with 5 items
- Color-coded status dots (success/warning/info)
- Timestamps
**Animations:**
- Fade-in-scale card entrance
- Slide-in-left for activity items
- Staggered delays per item
- Ping/pulse effect on status dots
- Slide-right on hover
- Status dot scale on hover

#### 4. **SystemOverview.vue** (`components/SystemOverview.vue`)
**Features:**
- Progress bars for CPU, Memory, Storage
- Percentage values
**Animations:**
- Fade-in-scale card entrance
- Slide-in-right for progress items
- Animated progress bar fill on load
- Shimmer effect on progress bars
- Value scale on hover

#### 5. **QuickActions.vue** (`components/QuickActions.vue`)
**Features:**
- 4 action buttons with icons
- Click handlers
**Animations:**
- Slide-up entrance with stagger
- Slide-right on hover
- Icon rotation and scale on hover
- Shine/sweep effect across buttons
- Scale-down on active/click

## 🎨 Micro-Animations Added

### Global Animations:
1. **Sidebar Toggle** - Smooth width transition with cubic-bezier easing
2. **Theme Switch** - Seamless color transitions
3. **Scrollbar** - Custom styled with smooth hover states

### Component-Specific:
1. **Stat Cards**
   - slideInUp entrance
   - Lift on hover (-4px translateY)
   - Value pulse/scale
   - Box shadow expansion

2. **Activity Items**
   - Pulse dots with ping animation (infinite)
   - Slide-in-left entrance
   - Slide-right on hover
   - Fade transitions

3. **Progress Bars**
   - Animated fill from 0 to value
   - Shimmer/shine effect
   - Smooth width transitions

4. **Action Buttons**
   - Sweep/shine effect on hover
   - Icon rotation (5deg) and scale
   - Slide-right transform
   - Scale down on active

5. **Navigation Items**
   - Active indicator bar height animation
   - Slide-right on hover
   - Icon scale (1.1x)
   - Color transitions

### CSS Animations:
```css
@keyframes fadeIn
@keyframes fadeInSlide
@keyframes fadeInScale
@keyframes slideInUp
@keyframes slideInLeft
@keyframes slideInRight
@keyframes progressLoad
@keyframes shimmer
@keyframes ping
```

## 🎯 Design Features

### Theming:
- Light mode (clean whites, subtle grays)
- Dark mode (pure blacks, high contrast)
- CSS variables for easy customization
- Smooth theme transitions

### Typography:
- Inter font family
- Professional weight scale (300-700)
- Optimized letter-spacing
- Anti-aliased rendering

### Layout:
- Responsive grid systems
- Flexbox compositions
- Fixed sidebar with fluid content
- Mobile-first approach

### Interactions:
- Hover states on all interactive elements
- Active states with visual feedback
- Smooth transitions (200-600ms)
- Scale transforms for depth
- Color shifts for emphasis

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (Full sidebar, all features)
- **Tablet**: 768px - 1024px (Narrow sidebar)
- **Mobile**: < 768px (Hidden sidebar, full-width content)

## 🚀 Performance

- Component-based lazy loading
- CSS animations (GPU accelerated)
- Minimal reflows
- LocalStorage for state persistence
- Optimized transitions with cubic-bezier

## 🎨 Color System

### Light Mode:
- Background: #fafafa
- Surface: #ffffff
- Border: #e5e5e5
- Text Primary: #0a0a0a
- Text Secondary: #737373

### Dark Mode:
- Background: #0a0a0a
- Surface: #121212
- Border: #262626
- Text Primary: #fafafa
- Text Secondary: #a3a3a3

### Semantic Colors:
- Success: #22c55e (green)
- Warning: #f59e0b (yellow)
- Info: #3b82f6 (blue)
- Accent: Dynamic (black/white)

## 📦 Component Props & Events

### Sidebar
**Props**: `isCollapsed`, `isDark`
**Events**: `@toggle`, `@toggle-theme`, `@nav-change`

### StatCard
**Props**: `label`, `value`, `change`, `changeType`

### ActivityCard
**Props**: None (self-contained data)

### SystemOverview
**Props**: None (self-contained data)

### QuickActions
**Props**: None (self-contained data)

## 🔧 State Management

- Theme: localStorage + reactive ref
- Sidebar: localStorage + reactive ref
- Navigation: Local reactive ref
- No external state library needed

## ✨ Best Practices

1. ✅ Composition API with script setup
2. ✅ Scoped styles per component
3. ✅ Semantic HTML
4. ✅ Accessibility (aria-labels, titles)
5. ✅ Performance optimized animations
6. ✅ Mobile responsive
7. ✅ Clean component separation
8. ✅ Reusable and modular design
