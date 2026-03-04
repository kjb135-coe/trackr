import React from 'react';
import { motion } from 'framer-motion';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Period } from './useDashboardData';

interface DashboardHeaderProps {
  name?: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({
  name,
  period,
  onPeriodChange,
}) => {
  const theme = useThemeClasses();
  const greeting = name ? `${name}'s Dashboard` : 'Dashboard';

  return (
    <div className="flex items-center justify-between">
      <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>{greeting}</h1>

      <div
        className={`relative flex rounded-lg p-0.5 ${
          theme.isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        {PERIODS.map(({ value, label }) => {
          const isActive = period === value;
          return (
            <button
              key={value}
              onClick={() => onPeriodChange(value)}
              className={`relative z-10 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'text-white'
                  : theme.isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="period-indicator"
                  className="absolute inset-0 bg-blue-500 rounded-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';
