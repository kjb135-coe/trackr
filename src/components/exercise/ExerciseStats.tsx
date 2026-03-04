import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, TrendingUp } from 'lucide-react';
import { ExerciseEntry } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ExerciseStatsProps {
  entries: ExerciseEntry[];
}

export const ExerciseStats: React.FC<ExerciseStatsProps> = ({ entries }) => {
  const theme = useThemeClasses();

  if (entries.length === 0) return null;

  const totalMinutes = entries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalCalories = entries.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
  const totalSessions = entries.length;
  const avgDuration = Math.round(totalMinutes / totalSessions);

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const stats = [
    {
      icon: Clock,
      label: 'Total Time',
      value: formatMinutes(totalMinutes),
      color: 'text-blue-500',
    },
    {
      icon: Dumbbell,
      label: 'Sessions',
      value: `${totalSessions}`,
      color: 'text-green-500',
    },
    {
      icon: Flame,
      label: 'Calories',
      value: totalCalories > 0 ? `${totalCalories}` : '—',
      color: 'text-orange-500',
    },
    {
      icon: TrendingUp,
      label: 'Avg Duration',
      value: formatMinutes(avgDuration),
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`p-3 rounded-lg ${
            theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
          } border`}
        >
          <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
          <div className={`text-lg font-semibold ${theme.textPrimary}`}>{stat.value}</div>
          <div className={`text-xs ${theme.textMuted}`}>{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};
