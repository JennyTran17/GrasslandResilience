# Grassland Resilience Navigator - Theme Guide

## Color Palette

### 🌱 Earth Tones (Primary)
```css
earth-50   #f7f7f4  /* Light cream backgrounds */
earth-100  #eeede6  /* Warm white cards */
earth-500  #8b8463  /* Earth brown accents */
earth-700  #5a5640  /* Deep earth borders */
```

### 🌿 Grassland Greens (Health Indicators)
```css
grass-50   #f0fdf4  /* Healthy area backgrounds */
grass-400  #4ade80  /* Good health indicators */
grass-600  #16a34a  /* Primary action buttons */
grass-800  #166534  /* Dark green headers */
```

### 💧 Water Blues (Moisture Data)
```css
water-300  #7dd3fc  /* Light moisture indicators */
water-500  #0ea5e9  /* Primary water data */
water-700  #0369a1  /* Deep water elements */
```

### ⚠️ Stress Indicators (Drought/Heat)
```css
stress-100 #fef3c7  /* Light warning backgrounds */
stress-400 #fbbf24  /* Medium stress indicators */
stress-600 #d97706  /* High stress warnings */
```

### 🚨 Alert System (Risk Levels)
```css
alert-low      #22c55e  /* Low risk - Green */
alert-medium   #f59e0b  /* Medium risk - Amber */
alert-high     #f97316  /* High risk - Orange */
alert-critical #ef4444  /* Critical risk - Red */
```

### 🔧 Tech Accents (Modern UI)
```css
tech-100  #f1f5f9  /* Light tech backgrounds */
tech-500  #64748b  /* Neutral tech elements */
tech-800  #1e293b  /* Dark tech text */
```

## Component Classes

### Buttons
```html
<!-- Primary Action -->
<button class="btn-primary">Analyze Risk</button>

<!-- Secondary Action -->
<button class="btn-secondary">View Details</button>

<!-- Alert/Critical -->
<button class="btn-alert">Emergency Protocol</button>

<!-- Ghost/Minimal -->
<button class="btn-ghost">Cancel</button>
```

### Cards & Panels
```html
<!-- Base Card -->
<div class="card-base p-6">Content</div>

<!-- Earth-toned Card -->
<div class="card-earth p-6">Natural data</div>

<!-- Tech Card -->
<div class="card-tech p-6">Technical info</div>

<!-- Glass Effect -->
<div class="card-glass p-6">Overlay content</div>
```

### Risk Level Cards
```html
<!-- Low Risk -->
<div class="risk-low p-4 rounded-lg">
  <h3>Low Risk Area</h3>
  <p>Optimal conditions detected</p>
</div>

<!-- Medium Risk -->
<div class="risk-medium p-4 rounded-lg">
  <h3>Medium Risk</h3>
  <p>Monitor conditions closely</p>
</div>

<!-- High Risk -->
<div class="risk-high p-4 rounded-lg">
  <h3>High Risk</h3>
  <p>Intervention recommended</p>
</div>

<!-- Critical Risk -->
<div class="risk-critical p-4 rounded-lg">
  <h3>Critical Risk</h3>
  <p>Immediate action required</p>
</div>
```

### Collapsible Panels
```html
<div class="panel-main">
  <div class="panel-header p-4">
    <h2>Risk Analysis</h2>
  </div>
  <div class="panel-collapsible p-4">
    <p>Collapsible content</p>
  </div>
</div>
```

### Map Container
```html
<div class="map-container h-full">
  <!-- Map content -->
  
  <!-- Overlay Controls -->
  <div class="map-overlay top-4 left-4 p-4">
    <h3>Layer Controls</h3>
  </div>
</div>
```

### Data Visualization
```html
<!-- Progress Bars -->
<div class="w-full bg-tech-200 rounded-full h-2">
  <div class="data-bar data-bar-medium" style="width: 65%"></div>
</div>

<!-- Status Indicators -->
<div class="flex items-center space-x-2">
  <div class="status-dot status-online"></div>
  <span>System Online</span>
</div>
```

## Typography Scale

### Font Families
```css
font-sans     /* Inter - Body text */
font-display  /* Outfit - Headings */
font-mono     /* JetBrains Mono - Data */
```

### Text Styles
```html
<!-- Display Text -->
<h1 class="text-display text-3xl">Dashboard Title</h1>

<!-- Data Values -->
<span class="text-data text-lg">-0.15 NDVI</span>

<!-- Muted Text -->
<p class="text-muted text-sm">Last updated 2 hours ago</p>
```

## Interactive Elements

### Custom Checkboxes
```html
<input type="checkbox" class="checkbox-custom">
```

### Toggle Switches
```html
<button class="toggle-switch">
  <span class="toggle-switch-active"></span>
</button>
```

## Utility Classes

### Effects
```html
<!-- Glass Morphism -->
<div class="glass-effect p-6">Translucent panel</div>

<!-- Gradients -->
<div class="earth-gradient p-6">Natural background</div>
<div class="tech-gradient p-6">Tech background</div>

<!-- Animations -->
<div class="fade-in">Animated content</div>
```

## Usage Examples

### Header Component
```html
<header class="bg-gradient-to-r from-grass-700 to-grass-800 text-white">
  <div class="flex items-center justify-between p-4">
    <h1 class="text-display text-xl">🌱 Grassland Resilience Navigator</h1>
    <nav class="space-x-4">
      <button class="btn-ghost">Help</button>
      <button class="btn-ghost">Settings</button>
    </nav>
  </div>
</header>
```

### Risk Summary Panel
```html
<div class="card-base p-6 space-y-4">
  <h2 class="text-display text-lg text-tech-800">Current Risk Level</h2>
  
  <div class="risk-high p-4 rounded-lg">
    <div class="flex items-center space-x-2">
      <div class="status-dot bg-orange-500"></div>
      <span class="font-semibold">High Risk Detected</span>
    </div>
    <p class="text-sm mt-2">Drought stress indicators elevated</p>
  </div>
  
  <div class="space-y-2">
    <div class="flex justify-between text-sm">
      <span class="text-muted">NDVI Anomaly</span>
      <span class="text-data">-0.15</span>
    </div>
    <div class="w-full bg-tech-200 rounded-full h-2">
      <div class="data-bar data-bar-high" style="width: 75%"></div>
    </div>
  </div>
</div>
```

This theme provides a perfect balance of natural earth tones with modern tech aesthetics, ensuring both farmers and technical users feel comfortable while maintaining high contrast for critical alerts.