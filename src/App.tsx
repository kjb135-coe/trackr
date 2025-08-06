import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from './stores/habitStore';
import { HabitCalendarGrid } from './components/calendar/HabitCalendarGrid';
import { SimpleHabitModal } from './components/calendar/SimpleHabitModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ThemeProvider } from './contexts/ThemeContext';
import { useThemeClasses } from './hooks/useThemeClasses';
import { ControlPanel } from './components/ui';
import { MonthlyCalendarPage } from './components/pages/MonthlyCalendarPage';

function AppContent() {
  const { 
    habits, 
    preferences,
    isLoading, 
    error, 
    loadData, 
    completeHabit, 
    addHabit,
    updateHabit,
    deleteHabit,
    checkAchievements,
    clearError 
  } = useHabitStore();
  
  const theme = useThemeClasses();
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [currentView, setCurrentView] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleCompletion = async (habitId: string, dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    await completeHabit(habitId, date);
    await checkAchievements();
  };

  const handleEditHabit = async (habit: any) => {
    await updateHabit(habit);
  };

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId);
  };

  const handleAddHabit = () => {
    setShowHabitModal(true);
  };

  const handleViewMonthly = () => {
    setCurrentView('monthly');
  };

  const handleBackToWeekly = () => {
    setCurrentView('weekly');
  };

  const handleSaveHabit = async (habit: any) => {
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
          <div className={`w-12 h-12 border-4 ${theme.isDark ? 'border-gray-700 border-t-blue-400' : 'border-gray-200 border-t-blue-600'} rounded-full animate-spin mx-auto mb-4`}></div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${theme.textSecondary} font-medium text-lg`}
          >
            Loading your habits...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'monthly') {
    return (
      <div className="min-h-screen transition-all duration-300">
        <MonthlyCalendarPage 
          habits={habits} 
          onBack={handleBackToWeekly}
          installDate={preferences.installDate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-300">
      {/* Control Panel */}
      <ControlPanel 
        onAddHabit={handleAddHabit} 
        habits={habits} 
        onViewMonthly={handleViewMonthly}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <HabitCalendarGrid
          habits={habits}
          preferences={preferences}
          onToggleCompletion={handleToggleCompletion}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
        />
      </motion.div>

      {/* Modals */}
      <SimpleHabitModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSave={handleSaveHabit}
      />

      <OnboardingFlow
        isOpen={preferences.showOnboarding && !isLoading}
        onComplete={() => {}}
      />

      {/* Enhanced Error Toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-6 right-6 ${theme.isDark ? 'bg-red-500/90 border-red-400/50' : 'bg-red-500/95 border-red-400/50'} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm z-50 border backdrop-blur-md`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium pr-2">{error}</span>
            <button
              onClick={clearError}
              className="text-white/80 hover:text-white font-bold text-xl transition-colors hover:scale-110 transform"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Contact Section */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 flex items-center gap-4 text-lg z-40"
      >
        <div className={`${theme.isDark ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-4`}>
          <a
            href="https://x.com/kc_e_e"
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors text-xl`}
            aria-label="Follow on X"
          >
            𝕏
          </a>
          <a
            href="https://www.linkedin.com/in/keegan-borig-0a100514a/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors text-xl`}
            aria-label="Connect on LinkedIn"
          >
            in
          </a>
          <a
            href="mailto:keeganborig@gmail.com"
            className={`${theme.isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors text-xl`}
            aria-label="Send email"
          >
            ✉
          </a>
        </div>
      </motion.footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;