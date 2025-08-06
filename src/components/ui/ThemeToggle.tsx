import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ThemeToggleProps {
  fullWidth?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ fullWidth = false }) => {
  const { theme, setTheme } = useTheme();
  const themeClasses = useThemeClasses();

  const themes = [
    { key: 'light' as const, label: 'Light', icon: Sun },
    { key: 'dark' as const, label: 'Dark', icon: Moon },
  ];

  return (
    <div className={`flex items-center gap-1 ${themeClasses.isDark ? 'bg-gray-800/60 border border-gray-700/50' : 'bg-gray-100/80 border border-gray-200/50'} rounded-xl p-1.5 backdrop-blur-sm shadow-sm ${fullWidth ? 'w-full' : ''}`}>
      {themes.map(({ key, label, icon: Icon }) => (
        <motion.button
          key={key}
          onClick={() => setTheme(key)}
          className={`relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 ${fullWidth ? 'flex-1 justify-center' : ''} ${
            theme === key
              ? themeClasses.isDark 
                ? 'bg-gray-700 text-gray-100 shadow-md' 
                : 'bg-white text-gray-800 shadow-md'
              : themeClasses.isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
          }`}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className={fullWidth ? '' : 'hidden sm:inline'}>{label}</span>
          
          {theme === key && (
            <motion.div
              layoutId="theme-indicator"
              className={`absolute inset-0 ${themeClasses.isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md -z-10`}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};