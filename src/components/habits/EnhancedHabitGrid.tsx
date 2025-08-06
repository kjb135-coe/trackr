import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { HabitV2 } from '../../types';
import { EnhancedHabitCard } from './EnhancedHabitCard';
import { Button } from '../ui';

interface EnhancedHabitGridProps {
  habits: HabitV2[];
  onCompleteHabit: (habitId: string) => void;
  onEditHabit: (habit: HabitV2) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddHabit: () => void;
}

export const EnhancedHabitGrid: React.FC<EnhancedHabitGridProps> = ({ 
  habits, 
  onCompleteHabit, 
  onEditHabit,
  onDeleteHabit,
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
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-6xl mb-4"
        >
          🌱
        </motion.div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">
          Let's start building habits!
        </h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Create your first habit and begin your journey toward better daily routines. 
          Small steps lead to big changes.
        </p>
        <Button onClick={onAddHabit} size="lg" className="shadow-xl">
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Habit
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-semibold text-slate-800"
        >
          Your Habits
          <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {habits.length} habit{habits.length !== 1 ? 's' : ''}
          </span>
        </motion.h2>
        <Button 
          onClick={onAddHabit} 
          variant="secondary"
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {habits.map((habit, index) => (
          <div key={habit.id} className="group">
            <EnhancedHabitCard
              habit={habit}
              onComplete={onCompleteHabit}
              onEdit={onEditHabit}
              onDelete={onDeleteHabit}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
      >
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="text-2xl font-bold text-slate-800">
            {habits.reduce((sum, h) => sum + h.analytics.totalCompletions, 0)}
          </div>
          <div className="text-sm text-slate-600">Total Completions</div>
        </div>
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="text-2xl font-bold text-orange-600">
            {Math.max(...habits.map(h => h.streak), 0)}
          </div>
          <div className="text-sm text-slate-600">Longest Streak</div>
        </div>
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="text-2xl font-bold text-success-600">
            {habits.filter(h => h.streak > 0).length}
          </div>
          <div className="text-sm text-slate-600">Active Streaks</div>
        </div>
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="text-2xl font-bold text-primary-600">
            {Math.round(habits.reduce((sum, h) => sum + h.analytics.averagePerWeek, 0) / habits.length) || 0}
          </div>
          <div className="text-sm text-slate-600">Avg per Week</div>
        </div>
      </motion.div>
    </div>
  );
};