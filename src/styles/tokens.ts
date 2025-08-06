// Design Tokens for Trackr
export const tokens = {
  // Spacing (8pt scale)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Border widths
  borderWidth: {
    thin: '1px',
    thick: '2px',
  },

  // Colors
  colors: {
    // Primary accent (blue across both themes)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Light theme colors
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceElevated: '#ffffff',
      border: '#e2e8f0',
      borderSubtle: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
    },

    // Dark theme colors (improved contrast)
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceElevated: '#334155',
      border: '#475569',
      borderSubtle: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
    },

    // Semantic colors
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Focus ring
  focus: {
    ring: '0 0 0 2px rgb(59 130 246 / 0.5)',
    ringOffset: '0 0 0 2px rgb(255 255 255)',
    ringOffsetDark: '0 0 0 2px rgb(15 23 42)',
  },

  // Component specific tokens
  grid: {
    cellMinHeight: '48px',
    cellSize: '40px',
  },
} as const;

export type Tokens = typeof tokens;