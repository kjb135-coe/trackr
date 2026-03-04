import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { NutritionMeal } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { format } from 'date-fns';

interface NutritionStatsProps {
  entries: NutritionMeal[];
}

export const NutritionStats: React.FC<NutritionStatsProps> = ({ entries }) => {
  const theme = useThemeClasses();

  // Today's totals
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayMeals = entries.filter(e => e.date === todayStr);
  const todayCalories = todayMeals.reduce((s, m) => s + m.totalCalories, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.totalProtein, 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + m.totalCarbs, 0);
  const todayFat = todayMeals.reduce((s, m) => s + m.totalFat, 0);

  const stats = [
    {
      icon: Flame,
      label: 'Calories',
      value: `${todayCalories}`,
      color: 'text-orange-500',
    },
    {
      icon: Beef,
      label: 'Protein',
      value: `${todayProtein}g`,
      color: 'text-red-500',
    },
    {
      icon: Wheat,
      label: 'Carbs',
      value: `${todayCarbs}g`,
      color: 'text-yellow-500',
    },
    {
      icon: Droplets,
      label: 'Fat',
      value: `${todayFat}g`,
      color: 'text-blue-500',
    },
  ];

  return (
    <div>
      <h3 className={`text-sm font-medium ${theme.textSecondary} mb-2`}>Today's Totals</h3>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-lg text-center ${
              theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
            } border`}
          >
            <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
            <div className={`text-lg font-semibold ${theme.textPrimary}`}>{stat.value}</div>
            <div className={`text-xs ${theme.textMuted}`}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
