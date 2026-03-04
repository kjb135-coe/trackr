import React from 'react';
import { motion } from 'framer-motion';
import { Moon, TrendingUp, Clock, Star } from 'lucide-react';
import { SleepEntry } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface SleepStatsProps {
  entries: SleepEntry[];
}

export const SleepStats: React.FC<SleepStatsProps> = ({ entries }) => {
  const theme = useThemeClasses();

  if (entries.length === 0) return null;

  const avgDuration = Math.round(
    entries.reduce((sum, e) => sum + e.durationMinutes, 0) / entries.length
  );
  const avgQuality = (
    entries.reduce((sum, e) => sum + e.quality, 0) / entries.length
  ).toFixed(1);
  const totalNights = entries.length;
  const goodNights = entries.filter(e => e.quality >= 4).length;

  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const stats = [
    {
      icon: Clock,
      label: 'Avg Duration',
      value: formatDuration(avgDuration),
      color: 'text-blue-500',
    },
    {
      icon: Star,
      label: 'Avg Quality',
      value: `${avgQuality}/5`,
      color: 'text-yellow-500',
    },
    {
      icon: Moon,
      label: 'Total Nights',
      value: `${totalNights}`,
      color: 'text-purple-500',
    },
    {
      icon: TrendingUp,
      label: 'Good Nights',
      value: `${goodNights}/${totalNights}`,
      color: 'text-green-500',
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
