import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from './stores/habitStore';
import { HabitCalendarGrid } from './components/calendar/HabitCalendarGrid';
import { SimpleHabitModal } from './components/calendar/SimpleHabitModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ThemeProvider } from './contexts/ThemeContext';
import { useThemeClasses } from './hooks/useThemeClasses';

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

  return (
    <div className="min-h-screen transition-all duration-300">
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
          onAddHabit={handleAddHabit}
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