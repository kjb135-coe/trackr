import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { HabitStats } from './useDashboardData';

interface WeakestHabitsProps {
  habits: HabitStats[];
}

export const WeakestHabits: React.FC<WeakestHabitsProps> = React.memo(({ habits }) => {
  const theme = useThemeClasses();

  if (habits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${
        theme.isDark ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-200'
      } border`}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <h3 className={`text-sm font-medium ${theme.isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          Areas for Improvement
        </h3>
      </div>
      <div className="space-y-2">
        {habits.map((stat) => (
          <div key={stat.habit.id} className="flex items-center justify-between">
            <span className={`text-sm ${theme.textPrimary}`}>
              {stat.habit.emoji} {stat.habit.name}
            </span>
            <span className={`text-sm font-medium ${
              stat.completionRate < 30 ? 'text-red-500' : 'text-amber-500'
            }`}>
              {stat.completionRate}%
            </span>
          </div>
        ))}
      </div>
      <p className={`text-xs ${theme.textMuted} mt-3`}>
        Focus on improving consistency with these habits.
      </p>
    </motion.div>
  );
});

WeakestHabits.displayName = 'WeakestHabits';
