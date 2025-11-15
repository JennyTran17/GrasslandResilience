# Grassland Resilience Navigator - UI Wireframe

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HEADER (60px)                                  │
│  ┌─────────────────┐                                    ┌─────────────────┐ │
│  │ 🌱 Grassland    │                                    │ Help | Settings │ │
│  │ Resilience      │                                    │                 │ │
│  │ Navigator       │                                    │                 │ │
│  └─────────────────┘                                    └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────┐  ┌───────────────┐ │
│  │                                                     │  │               │ │
│  │                                                     │  │  SIDE PANEL   │ │
│  │                                                     │  │  (320px)      │ │
│  │                                                     │  │               │ │
│  │                                                     │  │ ┌───────────┐ │ │
│  │                                                     │  │ │ Risk      │ │ │
│  │                                                     │  │ │ Summary   │ │ │
│  │                                                     │  │ └───────────┘ │ │
│  │                                                     │  │               │ │
│  │                MAP CONTAINER                        │  │ ┌───────────┐ │ │
│  │                (Leaflet.js)                         │  │ │ NDVI      │ │ │
│  │                                                     │  │ │ Anomaly   │ │ │
│  │  ┌─────────────────────────────────────────────┐    │  │ └───────────┘ │ │
│  │  │ Layer Controls                              │    │  │               │ │
│  │  │ ☑ NDVI Anomaly  ☑ Soil Moisture            │    │  │ ┌───────────┐ │ │
│  │  │ ☑ Risk Level    ☐ Precipitation             │    │  │ │ SMAP Soil │ │ │
│  │  └─────────────────────────────────────────────┘    │  │ │ Moisture  │ │ │
│  │                                                     │  │ └───────────┘ │ │
│  │  ┌─────────────────────────────────────────────┐    │  │               │ │
│  │  │ Legend                                      │    │  │ ┌───────────┐ │ │
│  │  │ 🟢 Low Risk    🟡 Medium Risk               │    │  │ │ Management│ │ │
│  │  │ 🟠 High Risk   🔴 Critical Risk             │    │  │ │ Advice    │ │ │
│  │  └─────────────────────────────────────────────┘    │  │ └───────────┘ │ │
│  │                                                     │  │               │ │
│  │                                                     │  │ ┌───────────┐ │ │
│  │                                                     │  │ │ [Collapse]│ │ │
│  │                                                     │  │ └───────────┘ │ │
│  └─────────────────────────────────────────────────────┘  └───────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Component (60px height)
- **Left**: Brand logo and title "Grassland Resilience Navigator"
- **Right**: Navigation links (Help, Settings, User profile)
- **Background**: Dark green (#2d5016) with white text
- **Position**: Fixed top, full width

### 2. Main Container (Flexbox layout)
- **Left**: Map container (flexible width)
- **Right**: Collapsible side panel (320px when open, 40px when collapsed)

### 3. Map Container (Leaflet.js)
- **Full height**: calc(100vh - 60px)
- **Overlays**:
  - Layer toggle controls (top-left)
  - Data legend (bottom-left)
  - Zoom controls (top-right, default Leaflet)
- **Base layer**: NASA GIBS imagery
- **Data layers**: NDVI anomaly, SMAP soil moisture, risk levels

### 4. Side Panel (Collapsible)
- **Width**: 320px (expanded) / 40px (collapsed)
- **Sections**:
  - Risk Summary (current location overview)
  - NDVI Anomaly data and visualization
  - SMAP Soil Moisture data and charts
  - Management Advice based on risk level
  - Collapse/expand toggle button

### 5. Interactive Elements
- **Layer Toggles**: Checkboxes to show/hide data layers
- **Legend**: Color-coded risk levels and data ranges
- **Panel Toggle**: Collapse/expand side panel
- **Map Controls**: Pan, zoom, layer selection

## Responsive Behavior
- **Desktop**: Full layout as shown
- **Tablet**: Side panel becomes overlay modal
- **Mobile**: Side panel becomes bottom sheet, simplified controls

## Color Scheme
- **Primary**: Green (#2d5016, #4a7c59)
- **Risk Colors**: Green (#22c55e), Yellow (#eab308), Orange (#f97316), Red (#ef4444)
- **Background**: Light gray (#f8fafc)
- **Text**: Dark gray (#1f2937)