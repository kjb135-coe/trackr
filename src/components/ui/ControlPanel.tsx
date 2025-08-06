import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Brain, Calendar, Users, TrendingUp } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { WeeklyProgress } from '../features/WeeklyProgress';
import { HabitInsights } from '../features/HabitInsights';
import { SocialHub } from '../features/SocialHub';
import { HabitV2 } from '../../types';
import { useHabitStore } from '../../stores/habitStore';

interface ControlPanelProps {
  onAddHabit: () => void;
  habits: HabitV2[];
  onViewMonthly: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onAddHabit, habits, onViewMonthly }) => {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const theme = useThemeClasses();
  const { preferences, updatePreferences } = useHabitStore();

  const handleGoalUpdate = async (newGoal: number) => {
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
                <button
                  onClick={() => setShowGoalModal(true)}
                  className={`${theme.isDark ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} 
                    w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {preferences.weeklyGoal ? `Weekly Goal (${preferences.weeklyGoal}%)` : 'Set Weekly Goal'}
                </button>
              </div>

              {/* Future Features - De-emphasized */}
              <div className="pt-1">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveFeature('insights');
                      setIsOpen(false);
                    }}
                    className={`${theme.textSecondary} hover:${theme.textPrimary} w-full flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors opacity-60`}
                  >
                    <Brain className="w-3 h-3 text-purple-400" />
                    <span className="flex-1 text-left">Insights</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveFeature('social');
                      setIsOpen(false);
                    }}
                    className={`${theme.textSecondary} hover:${theme.textPrimary} w-full flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors opacity-60`}
                  >
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span className="flex-1 text-left">Social</span>
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

      {/* Feature Modals */}
      <WeeklyProgress 
        isOpen={activeFeature === 'weekly'} 
        onClose={() => setActiveFeature(null)} 
      />
      <HabitInsights 
        isOpen={activeFeature === 'insights'} 
        onClose={() => setActiveFeature(null)} 
      />
      <SocialHub 
        isOpen={activeFeature === 'social'} 
        onClose={() => setActiveFeature(null)} 
      />
    </div>
  );
};