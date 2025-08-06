import { useTheme } from '../contexts/ThemeContext';

export const useThemeClasses = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return {
    // Card classes
    card: isDark ? 'card-dark' : 'card-light',
    glass: isDark ? 'glass-dark' : 'glass-light',
    
    // Button classes
    btnPrimary: isDark ? 'btn-primary-dark' : 'btn-primary-light',
    btnSecondary: isDark ? 'btn-secondary-dark' : 'btn-secondary-light',
    
    // Input classes
    input: isDark ? 'input-dark' : 'input-light',
    
    // Text classes
    textPrimary: isDark ? 'text-primary-dark' : 'text-primary-light',
    textSecondary: isDark ? 'text-secondary-dark' : 'text-secondary-light',
    textMuted: isDark ? 'text-muted-dark' : 'text-muted-light',
    
    // Background classes
    hoverBg: isDark ? 'hover-bg-dark' : 'hover-bg-light',
    
    // Calendar specific
    calendarHeader: isDark ? 'calendar-header-dark' : 'calendar-header-light',
    calendarCell: isDark ? 'calendar-cell-dark' : 'calendar-cell-light',
    calendarToday: isDark ? 'calendar-today-dark' : 'calendar-today-light',
    
    // Completion states
    completionUnchecked: isDark ? 'completion-unchecked-dark' : 'completion-unchecked-light',
    completionChecked: isDark ? 'completion-checked-dark' : 'completion-checked-light',
    
    // Helper properties
    isDark,
    isLight: !isDark,
  };
};