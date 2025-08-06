import { useTheme } from '../contexts/ThemeContext';
import { tokens } from '../styles/tokens';

export const useThemeClasses = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  // const colors = isDark ? tokens.colors.dark : tokens.colors.light;

  return {
    // Card classes with improved contrast
    card: `rounded-lg border shadow-md ${
      isDark 
        ? `bg-slate-800 border-slate-700` 
        : `bg-white border-gray-200`
    }`,
    
    glass: `backdrop-blur-sm border ${
      isDark
        ? `bg-slate-800/90 border-slate-700/50`
        : `bg-white/90 border-gray-200/50`
    }`,
    
    // Button hierarchy - using design tokens
    btnPrimary: `rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      isDark ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'
    } bg-blue-500 hover:bg-blue-600 text-white`,
    
    btnSecondary: `rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
      isDark 
        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-offset-slate-800' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-offset-white'
    }`,
    
    btnTertiary: `rounded-lg px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 ${
      isDark 
        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 focus:ring-offset-slate-800' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:ring-offset-white'
    }`,
    
    // Input classes with better contrast
    input: `rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
      isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:ring-offset-slate-800'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-offset-white'
    }`,
    
    // Text classes with improved contrast ratios
    textPrimary: isDark ? 'text-slate-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-slate-300' : 'text-gray-600', 
    textMuted: isDark ? 'text-slate-500' : 'text-gray-500',
    
    // Background classes
    hoverBg: isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50',
    
    // Calendar specific with tokens
    calendarHeader: `p-4 border-b ${
      isDark 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-gray-50 border-gray-200'
    }`,
    
    calendarCell: `transition-colors ${
      isDark
        ? 'bg-slate-800 border-slate-700 hover:bg-slate-750'
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`,
    
    calendarToday: isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200',
    
    // Completion states with consistent blue accent
    completionUnchecked: `border-2 transition-all ${
      isDark 
        ? 'border-slate-600 hover:border-blue-500' 
        : 'border-gray-300 hover:border-blue-400'
    }`,
    
    completionChecked: 'bg-blue-500 border-blue-500',
    
    // Focus ring with proper contrast
    focusRing: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      isDark ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'
    }`,
    
    // Helper properties
    isDark,
    isLight: !isDark,
    tokens,
  };
};