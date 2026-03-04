import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Calendar, TrendingUp } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { WeeklyGoalModal } from '../modals/WeeklyGoalModal';
import { HabitV2 } from '../../types';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface ControlPanelProps {
  onAddHabit: () => void;
  habits: HabitV2[];
  onViewMonthly: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onAddHabit, habits, onViewMonthly }) => {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default
  const [showGoalModal, setShowGoalModal] = useState(false);
  const theme = useThemeClasses();
  const { preferences, updatePreferences } = usePreferencesStore();

  const handleGoalUpdate = async (newGoal: number | undefined) => {
    await updatePreferences({ weeklyGoal: newGoal });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button (Gear) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`${theme.isDark ? 'bg-gray-800/90 border-gray-700/50 text-gray-200' : 'bg-white/90 border-gray-200/50 text-gray-800'} 
          backdrop-blur-sm border p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Settings className="w-5 h-5" />
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
            className={`absolute right-0 top-14 min-w-[250px] ${theme.isDark ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'} 
              backdrop-blur-sm border rounded-2xl shadow-2xl p-4`}
          >
            <div className="space-y-3">
              {/* Theme - Minimal */}
              <div className="pb-2">
                <ThemeToggle fullWidth />
              </div>

              {/* Divider */}
              <div className={`border-t ${theme.isDark ? 'border-gray-700' : 'border-gray-200'}`} />

              {/* Actions - Primary focus */}
              <div>
                <label className={`text-xs font-medium ${theme.textSecondary} uppercase tracking-wide block mb-2`}>
                  Actions
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onAddHabit();
                      setIsOpen(false);
                    }}
                    className={`bg-blue-500 hover:bg-blue-600 text-white w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors font-medium`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Habit
                  </button>
                  <button
                    onClick={() => {
                      onViewMonthly();
                      setIsOpen(false);
                    }}
                    className={`${theme.isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} 
                      w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors`}
                  >
                    <Calendar className="w-4 h-4" />
                    Monthly View
                  </button>
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className={`text-xs font-medium ${theme.textSecondary} uppercase tracking-wide block mb-2`}>
                  Goals
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className={`${theme.isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                      w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {preferences.weeklyGoal ? `Set Goal (${preferences.weeklyGoal}%)` : 'Set Weekly Goal'}
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

      {/* Goal Modal */}
      <WeeklyGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        currentGoal={preferences.weeklyGoal || 85}
        onSave={handleGoalUpdate}
      />
    </div>
  );
};