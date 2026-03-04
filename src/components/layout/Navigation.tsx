import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  LayoutDashboard, Settings, Plus, TrendingUp
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { WeeklyGoalModal } from '../modals/WeeklyGoalModal';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Habits', icon: CheckSquare },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

interface NavigationProps {
  onAddHabit: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onAddHabit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useThemeClasses();
  const { preferences, updatePreferences } = usePreferencesStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;

  // Close settings dropdown on click outside
  useEffect(() => {
    if (!settingsOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [settingsOpen]);

  const handleGoalUpdate = async (newGoal: number | undefined) => {
    await updatePreferences({ weeklyGoal: newGoal });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          theme.isDark
            ? 'bg-gray-900/95 border-gray-800'
            : 'bg-white/95 border-gray-200'
        } border-b backdrop-blur-sm`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Nav tabs */}
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = currentPath === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-500'
                        : theme.isDark
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {currentPath === '/' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddHabit}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Habit</span>
                </motion.button>
              )}

              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  aria-label="Open settings"
                  className={`p-2 rounded-lg transition-colors ${
                    theme.isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 top-10 min-w-[200px] z-50 ${
                        theme.isDark
                          ? 'bg-gray-800/95 border-gray-700/50'
                          : 'bg-white/95 border-gray-200/50'
                      } backdrop-blur-sm border rounded-xl shadow-2xl p-3 space-y-3`}
                    >
                      <ThemeToggle fullWidth />
                      <div className={`border-t ${theme.isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                      <button
                        onClick={() => {
                          navigate('/monthly');
                          setSettingsOpen(false);
                        }}
                        className={`${
                          theme.isDark
                            ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors`}
                      >
                        Monthly View
                      </button>
                      <button
                        onClick={() => {
                          setShowGoalModal(true);
                          setSettingsOpen(false);
                        }}
                        className={`${
                          theme.isDark
                            ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        {preferences.weeklyGoal
                          ? `Set Goal (${preferences.weeklyGoal}%)`
                          : 'Set Weekly Goal'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <WeeklyGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        currentGoal={preferences.weeklyGoal || 85}
        onSave={handleGoalUpdate}
      />
    </>
  );
};
