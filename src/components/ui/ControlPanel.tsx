import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ControlPanelProps {
  onAddHabit: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onAddHabit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useThemeClasses();

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`${theme.isDark ? 'bg-gray-800/90 border-gray-700/50 text-gray-200' : 'bg-white/90 border-gray-200/50 text-gray-800'} 
          backdrop-blur-sm border p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Settings className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 top-14 min-w-[200px] ${theme.isDark ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'} 
              backdrop-blur-sm border rounded-2xl shadow-2xl p-4`}
          >
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-2`}>
                  Theme
                </label>
                <ThemeToggle />
              </div>

              {/* Divider */}
              <div className={`border-t ${theme.isDark ? 'border-gray-700' : 'border-gray-200'}`} />

              {/* Actions */}
              <div>
                <label className={`text-sm font-medium ${theme.textSecondary} block mb-3`}>
                  Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onAddHabit();
                      setIsOpen(false);
                    }}
                    className={`${theme.btnPrimary} w-full flex items-center gap-3 px-4 py-3 text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Habit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};