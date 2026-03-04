import React from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { HabitCalendarGrid } from '../calendar/HabitCalendarGrid';

export const HabitsPage: React.FC = () => {
  const {
    habits,
    completeHabit,
    updateHabit,
    deleteHabit,
    checkAchievements,
  } = useHabitStore();
  const { preferences } = usePreferencesStore();

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <HabitCalendarGrid
        habits={habits}
        preferences={preferences}
        onToggleCompletion={handleToggleCompletion}
        onEditHabit={handleEditHabit}
        onDeleteHabit={handleDeleteHabit}
      />
    </motion.div>
  );
};
