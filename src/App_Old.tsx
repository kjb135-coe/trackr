import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from './stores/habitStore';
import { EnhancedHeroSection } from './components/dashboard/EnhancedHeroSection';
import { EnhancedHabitGrid } from './components/habits/EnhancedHabitGrid';
import { HabitModal } from './components/habits/HabitModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { StreakVisualization } from './components/dashboard/StreakVisualization';
import { AchievementDisplay } from './components/dashboard/AchievementDisplay';
import { InsightsPanel } from './components/dashboard/InsightsPanel';

function App() {
  const { 
    habits, 
    preferences,
    achievements,
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
  
  const [showHabitModal, setShowHabitModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteHabit = async (habitId: string) => {
    await completeHabit(habitId);
    // Check for new achievements after completing a habit
    await checkAchievements();
  };

  const handleAddHabit = () => {
    setShowHabitModal(true);
  };

  const handleEditHabit = (habit: any) => {
    // TODO: Implement edit functionality in modal
    console.log('Edit habit:', habit);
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
  };

  const handleSaveHabit = (habit: any) => {
    addHabit(habit);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-lg text-slate-600">Loading your habits...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Hero with horizontal progress */}
        <EnhancedHeroSection />
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - Habits */}
          <div className="xl:col-span-3 space-y-6">
            <EnhancedHabitGrid 
              habits={habits} 
              onCompleteHabit={handleCompleteHabit}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
              onAddHabit={handleAddHabit}
            />
          </div>
          
          {/* Sidebar - Stats & Achievements */}
          <div className="xl:col-span-1 space-y-6">
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-1 gap-6 space-y-6 lg:space-y-0 xl:space-y-6">
              <StreakVisualization habits={habits} />
              <AchievementDisplay achievements={achievements} />
              <div className="lg:col-span-2 xl:col-span-1">
                <InsightsPanel habits={habits} />
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-4 text-white hover:text-red-200"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        <HabitModal
          isOpen={showHabitModal}
          onClose={() => setShowHabitModal(false)}
          onSave={handleSaveHabit}
        />

        <OnboardingFlow
          isOpen={preferences.showOnboarding && !isLoading}
          onComplete={() => {}}
        />
      </div>
    </div>
  );
}

export default App;