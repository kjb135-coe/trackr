import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { HabitStats } from './useDashboardData';
import { Sparkline } from './Sparkline';

interface HabitBreakdownProps {
  habitStats: HabitStats[];
}

export const HabitBreakdown: React.FC<HabitBreakdownProps> = ({ habitStats }) => {
  const theme = useThemeClasses();

  if (habitStats.length === 0) return null;

  return (
    <div>
      <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Per-Habit Breakdown</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {habitStats.map((stat, i) => (
          <motion.div
            key={stat.habit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-lg ${
              theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
            } border`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{stat.habit.emoji}</span>
                <span className={`text-sm font-medium ${theme.textPrimary} truncate`}>
                  {stat.habit.name}
                </span>
              </div>
              <span
                className={`text-sm font-semibold flex-shrink-0 ${
                  stat.completionRate >= 80
                    ? 'text-green-500'
                    : stat.completionRate >= 50
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
              >
                {stat.completionRate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className={`text-xs ${theme.textMuted}`}>
                {stat.currentStreak > 0 && (
                  <span>Streak: {stat.currentStreak}d</span>
                )}
                {stat.currentStreak > 0 && stat.bestStreak > 0 && ' / '}
                {stat.bestStreak > 0 && (
                  <span>Best: {stat.bestStreak}d</span>
                )}
                {stat.currentStreak === 0 && stat.bestStreak === 0 && (
                  <span>{stat.totalInPeriod} completed</span>
                )}
              </div>
              <Sparkline
                data={stat.sparklineData}
                width={80}
                height={24}
                color={
                  stat.completionRate >= 80
                    ? '#22c55e'
                    : stat.completionRate >= 50
                    ? '#eab308'
                    : '#ef4444'
                }
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
