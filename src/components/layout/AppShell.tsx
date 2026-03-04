import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { SimpleHabitModal } from '../calendar/SimpleHabitModal';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { useHabitStore } from '../../stores/habitStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { HabitV2 } from '../../types';

export const AppShell: React.FC = () => {
  const {
    isLoading,
    error,
    loadData,
    addHabit,
    checkAchievements,
    clearError,
  } = useHabitStore();

  const { preferences, loadPreferences } = usePreferencesStore();

  const theme = useThemeClasses();
  const [showHabitModal, setShowHabitModal] = useState(false);

  useEffect(() => {
    loadData();
    loadPreferences();
  }, [loadData, loadPreferences]);

  const handleSaveHabit = async (habit: HabitV2) => {
    await addHabit(habit);
    await checkAchievements();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div
            className={`w-12 h-12 border-4 ${
              theme.isDark
                ? 'border-gray-700 border-t-blue-400'
                : 'border-gray-200 border-t-blue-600'
            } rounded-full animate-spin mx-auto mb-4`}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${theme.textSecondary} font-medium text-lg`}
          >
            Loading your data...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-300">
      <Navigation onAddHabit={() => setShowHabitModal(true)} />

      {/* Main content — pushed below nav bar */}
      <main className="pt-14">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <SimpleHabitModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSave={handleSaveHabit}
      />

      <OnboardingFlow isOpen={preferences.showOnboarding && !isLoading} />

      {/* Error Toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed bottom-6 right-6 ${
            theme.isDark
              ? 'bg-red-500/90 border-red-400/50'
              : 'bg-red-500/95 border-red-400/50'
          } text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm z-50 border backdrop-blur-md`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium pr-2">{error}</span>
            <button
              onClick={clearError}
              aria-label="Dismiss error"
              className="text-white/80 hover:text-white font-bold text-xl transition-colors hover:scale-110 transform"
            >
              x
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 flex items-center gap-4 text-lg z-40"
      >
        <div
          className={`${
            theme.isDark ? 'text-gray-500' : 'text-gray-400'
          } flex items-center gap-4`}
        >
          <a
            href="https://x.com/kc_e_e"
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              theme.isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'
            } transition-colors text-xl`}
            aria-label="Follow on X"
          >
            X
          </a>
          <a
            href="https://www.linkedin.com/in/keegan-borig-0a100514a/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              theme.isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'
            } transition-colors text-xl`}
            aria-label="Connect on LinkedIn"
          >
            in
          </a>
          <a
            href="mailto:keeganborig@gmail.com"
            className={`${
              theme.isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'
            } transition-colors text-xl`}
            aria-label="Send email"
          >
            @
          </a>
        </div>
      </motion.footer>
    </div>
  );
};
