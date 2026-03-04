import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../stores/habitStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { useJournalStore } from '../../stores/journalStore';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Period, useDashboardData } from './useDashboardData';
import { useMoodData } from './useMoodData';
import { DashboardHeader } from './DashboardHeader';
import { AggregateStats } from './AggregateStats';
import { CompletionHeatmap } from './CompletionHeatmap';
import { TrendChart } from './TrendChart';
import { HabitBreakdown } from './HabitBreakdown';
import { WeakestHabits } from './WeakestHabits';
import { MoodInsights } from './MoodInsights';

export const DashboardPage: React.FC = () => {
  const theme = useThemeClasses();
  const { habits, loadData } = useHabitStore();
  const { preferences } = usePreferencesStore();
  const { entries: journalEntries, loadEntries: loadJournal } = useJournalStore();
  const [period, setPeriod] = useState<Period>(30);

  const {
    dailyData,
    rollingAverage,
    habitStats,
    heatmapData,
    aggregate,
    weakestHabits,
  } = useDashboardData(habits, period);

  const moodData = useMoodData(journalEntries, period, dailyData);

  // Load journal entries on mount
  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  // Refresh data when tab becomes visible
  const handleVisibility = useCallback(() => {
    if (document.visibilityState === 'visible') {
      loadData();
      loadJournal();
    }
  }, [loadData, loadJournal]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [handleVisibility]);

  // Empty state
  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-6"
      >
        <DashboardHeader
          name={preferences.name}
          period={period}
          onPeriodChange={setPeriod}
        />
        <div className="mt-16 text-center">
          <motion.div
            className="text-6xl mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            📊
          </motion.div>
          <h3 className={`text-2xl font-semibold ${theme.textPrimary} mb-3`}>
            No data yet
          </h3>
          <p className={`${theme.textSecondary} text-base max-w-md mx-auto`}>
            Add some habits and start tracking to see your analytics here.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
    >
      <DashboardHeader
        name={preferences.name}
        period={period}
        onPeriodChange={setPeriod}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <AggregateStats data={aggregate} />

          <CompletionHeatmap data={heatmapData} />

          <TrendChart dailyData={dailyData} rollingAverage={rollingAverage} />

          <HabitBreakdown habitStats={habitStats} />

          <MoodInsights data={moodData} />

          <WeakestHabits habits={weakestHabits} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
