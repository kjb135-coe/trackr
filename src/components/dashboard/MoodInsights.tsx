import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Sparkline } from './Sparkline';
import { MoodData } from './useMoodData';

const MOOD_EMOJIS = ['', '', '', '', '', ''];

function moodEmoji(avg: number): string {
  const rounded = Math.round(avg);
  return MOOD_EMOJIS[Math.min(Math.max(rounded, 0), 5)];
}

function moodColor(avg: number): string {
  if (avg >= 4) return 'text-green-500';
  if (avg >= 3) return 'text-yellow-500';
  return 'text-red-500';
}

interface MoodInsightsProps {
  data: MoodData;
}

export const MoodInsights: React.FC<MoodInsightsProps> = ({ data }) => {
  const theme = useThemeClasses();

  if (data.entryCount === 0) return null;

  // Filter out zero values for sparkline (only show days with entries)
  const sparklineData = data.moodTrend.filter(v => v > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${
        theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
      } border`}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={`w-4 h-4 ${theme.isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        <h3 className={`text-sm font-medium ${theme.textSecondary}`}>Mood Insights</h3>
        <span className={`text-xs ${theme.textMuted} ml-auto`}>
          {data.entryCount} {data.entryCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Average mood */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moodEmoji(data.averageMood)}</span>
          <div>
            <div className={`text-lg font-semibold ${moodColor(data.averageMood)}`}>
              {data.averageMood}
            </div>
            <div className={`text-xs ${theme.textMuted}`}>avg mood</div>
          </div>
        </div>

        {/* Sparkline */}
        {sparklineData.length >= 2 && (
          <div className="flex-1 flex justify-end">
            <Sparkline
              data={sparklineData}
              width={120}
              height={32}
              color={theme.isDark ? '#a78bfa' : '#7c3aed'}
            />
          </div>
        )}
      </div>

      {/* Correlation insight */}
      {data.correlation && data.correlation.difference !== 0 && (
        <div className={`mt-3 pt-3 border-t ${
          theme.isDark ? 'border-gray-700/50' : 'border-gray-200'
        }`}>
          <p className={`text-xs ${theme.textSecondary}`}>
            {data.correlation.difference > 0 ? (
              <>
                Your mood averages <span className="font-medium text-green-500">
                  {data.correlation.highCompletionMood}/5
                </span> on days you complete most habits vs <span className="font-medium text-amber-500">
                  {data.correlation.lowCompletionMood}/5
                </span> on lighter days.
              </>
            ) : (
              <>
                Your mood averages <span className="font-medium">
                  {data.correlation.lowCompletionMood}/5
                </span> on lighter days vs <span className="font-medium">
                  {data.correlation.highCompletionMood}/5
                </span> on high-completion days.
              </>
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
};
