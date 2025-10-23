/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Earth tone palette
        earth: {
          50: '#f7f7f4',   // Light cream
          100: '#eeede6',  // Warm white
          200: '#ddd9cc',  // Light beige
          300: '#c4bfa8',  // Medium beige
          400: '#a8a082',  // Warm gray
          500: '#8b8463',  // Earth brown
          600: '#6f6b4f',  // Dark earth
          700: '#5a5640',  // Deep earth
          800: '#4a4635',  // Very dark earth
          900: '#3d3a2d',  // Almost black earth
        },
        // Grassland greens
        grass: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green
          200: '#bbf7d0',  // Soft green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Healthy green
          500: '#22c55e',  // Primary green
          600: '#16a34a',  // Strong green
          700: '#15803d',  // Dark green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Deep forest green
        },
        // Water blues
        water: {
          50: '#f0f9ff',   // Very light blue
          100: '#e0f2fe',  // Light blue
          200: '#bae6fd',  // Soft blue
          300: '#7dd3fc',  // Medium blue
          400: '#38bdf8',  // Bright blue
          500: '#0ea5e9',  // Primary blue
          600: '#0284c7',  // Strong blue
          700: '#0369a1',  // Dark blue
          800: '#075985',  // Very dark blue
          900: '#0c4a6e',  // Deep blue
        },
        // Stress indicators
        stress: {
          50: '#fffbeb',   // Very light yellow
          100: '#fef3c7',  // Light yellow
          200: '#fde68a',  // Soft yellow
          300: '#fcd34d',  // Medium yellow
          400: '#fbbf24',  // Warning yellow
          500: '#f59e0b',  // Primary amber
          600: '#d97706',  // Strong amber
          700: '#b45309',  // Dark amber
          800: '#92400e',  // Very dark amber
          900: '#78350f',  // Deep amber
        },
        // Alert system
        alert: {
          low: '#22c55e',     // Green
          medium: '#f59e0b',  // Amber
          high: '#f97316',    // Orange
          critical: '#ef4444', // Red
        },
        // Tech accent colors
        tech: {
          50: '#f8fafc',   // Very light slate
          100: '#f1f5f9',  // Light slate
          200: '#e2e8f0',  // Soft slate
          300: '#cbd5e1',  // Medium slate
          400: '#94a3b8',  // Cool gray
          500: '#64748b',  // Primary slate
          600: '#475569',  // Strong slate
          700: '#334155',  // Dark slate
          800: '#1e293b',  // Very dark slate
          900: '#0f172a',  // Deep slate
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'display': ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        'tech': '0 4px 20px rgba(15, 23, 42, 0.15)',
        'earth': '0 4px 20px rgba(139, 132, 99, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}