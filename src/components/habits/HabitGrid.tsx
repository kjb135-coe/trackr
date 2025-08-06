import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { HabitV2 } from '../../types';
import { HabitCard } from './HabitCard';
import { Button } from '../ui';

interface HabitGridProps {
  habits: HabitV2[];
  onCompleteHabit: (habitId: string) => void;
  onAddHabit: () => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({ 
  habits, 
  onCompleteHabit, 
  onAddHabit 
}) => {
  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-2xl font-semibold text-slate-800 mb-2">
            Let's start building habits!
          </h3>
          <p className="text-slate-600 mb-6">
            Add your first habit to begin your journey toward better daily routines.
          </p>
          <Button onClick={onAddHabit} size="lg" className="shadow-xl">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Habit
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Your Habits
        </h2>
        <Button onClick={onAddHabit} variant="secondary">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit, index) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onComplete={onCompleteHabit}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};