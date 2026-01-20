# Component Placement Guide - Grassland Resilience Navigator

## Component Architecture

### Layout Hierarchy
```
App (page.jsx)
├── Header (fixed top)
└── Main Container (flex)
    ├── Map Container (flex-1)
    │   ├── BaseMap (Leaflet)
    │   ├── LayerControls (absolute top-left)
    │   └── Legend (absolute bottom-left)
    └── SidePanel (fixed width, collapsible)
```

## Component Specifications

### 1. Header Component
- **File**: `components/Header.jsx`
- **Position**: Fixed top, z-index 50
- **Height**: 64px (h-16)
- **Features**: Brand logo, title, navigation links
- **Styling**: Dark green background (#2d5016)

### 2. BaseMap Component
- **File**: `components/baseMap.jsx`
- **Container**: Fills available space (100% height/width)
- **Library**: Leaflet.js with react-leaflet
- **Data Source**: NASA GIBS imagery
- **Center**: Ireland coordinates [53.3, -8.0]

### 3. LayerControls Component
- **File**: `components/LayerControls.jsx`
- **Position**: Absolute top-left (top-4 left-4)
- **Features**: Checkboxes for data layer visibility
- **Layers**: NDVI, Soil Moisture, Risk Level, Precipitation
- **Styling**: Semi-transparent white background with backdrop blur

### 4. Legend Component
- **File**: `components/Legend.jsx`
- **Position**: Absolute bottom-left (bottom-4 left-4)
- **Features**: Color-coded risk levels with descriptions
- **Colors**: Green (low), Yellow (medium), Orange (high), Red (critical)

### 5. SidePanel Component
- **File**: `components/SidePanel.jsx`
- **Width**: 320px (expanded) / 48px (collapsed)
- **Features**: Collapsible, risk data, management advice
- **Sections**: Risk Summary, NDVI data, SMAP data, Management advice

## Interactive Elements

### Layer Toggle Functionality
```javascript
const handleLayerToggle = (layerKey, isVisible) => {
  // Implementation for showing/hiding map layers
  console.log(`Layer ${layerKey} toggled:`, isVisible);
};
```

### Panel Collapse/Expand
- Toggle button in panel header
- Smooth CSS transitions (duration-300)
- Responsive width changes

## Responsive Design Considerations

### Desktop (>1024px)
- Full layout as designed
- Side panel always visible
- All controls accessible

### Tablet (768px - 1024px)
- Side panel becomes overlay modal
- Layer controls remain positioned
- Touch-friendly interactions

### Mobile (<768px)
- Side panel becomes bottom sheet
- Simplified layer controls
- Optimized for touch navigation

## Future Enhancements

### Additional Components to Consider
1. **TimeSlider**: For temporal data navigation
2. **LocationSearch**: Geocoding and location finding
3. **DataExport**: Export functionality for reports
4. **AlertsPanel**: Real-time notifications
5. **ComparisonView**: Side-by-side temporal comparison

### Integration Points
- NASA GIBS API for satellite imagery
- SMAP API for soil moisture data
- MODIS API for NDVI calculations
- Weather API for precipitation data

## Development Notes

### Dependencies Required
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "tailwindcss": "^3.3.0"
}
```

### CSS Classes Used
- Tailwind utility classes for responsive design
- Custom backdrop-blur for glass morphism effects
- Transition classes for smooth animations

### State Management
- Local state for UI interactions (panel collapse, layer visibility)
- Consider Context API for global app state
- Future: Redux/Zustand for complex data management