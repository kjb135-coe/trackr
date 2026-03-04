import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, CheckSquare, Activity } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { AggregateData } from './useDashboardData';

interface AggregateStatsProps {
  data: AggregateData;
}

export const AggregateStats: React.FC<AggregateStatsProps> = React.memo(({ data }) => {
  const theme = useThemeClasses();

  const stats = [
    {
      icon: Target,
      label: 'Completion Rate',
      value: `${data.overallCompletionRate}%`,
      color: 'text-blue-500',
    },
    {
      icon: Flame,
      label: 'Best Streak',
      value: `${data.bestCurrentStreak}`,
      color: 'text-orange-500',
    },
    {
      icon: CheckSquare,
      label: 'Completions',
      value: `${data.totalCompletions}`,
      color: 'text-green-500',
    },
    {
      icon: Activity,
      label: 'Active Habits',
      value: `${data.activeHabitsCount}`,
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
});

AggregateStats.displayName = 'AggregateStats';
