import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { SleepEntry } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface SleepWeekViewProps {
  entries: SleepEntry[];
  onDayClick: (date: string) => void;
}

const QUALITY_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

export const SleepWeekView: React.FC<SleepWeekViewProps> = ({ entries, onDayClick }) => {
  const theme = useThemeClasses();

  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE'),
      dayNum: format(date, 'd'),
    };
  });

  const entryMap = new Map(entries.map(e => [e.date, e]));

  const maxDuration = Math.max(
    ...days.map(d => entryMap.get(d.dateStr)?.durationMinutes || 0),
    480 // 8h baseline
  );

  return (
    <div>
      <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Last 7 Days</h3>
      <div className="flex items-end gap-2">
        {days.map((day, i) => {
          const entry = entryMap.get(day.dateStr);
          const height = entry ? (entry.durationMinutes / maxDuration) * 100 : 0;
          const isToday = i === 6;

          return (
            <div
              key={day.dateStr}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => onDayClick(day.dateStr)}
            >
              {/* Bar */}
              <div
                className={`w-full rounded-t-md relative ${
                  theme.isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}
                style={{ height: '120px' }}
              >
                {entry && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`absolute bottom-0 left-0 right-0 rounded-t-md ${
                      entry.durationMinutes >= 420
                        ? 'bg-blue-500'
                        : entry.durationMinutes >= 360
                        ? 'bg-blue-400'
                        : 'bg-blue-300'
                    }`}
                  />
                )}
              </div>

              {/* Quality dot */}
              {entry && (
                <div
                  className={`w-2.5 h-2.5 rounded-full ${QUALITY_COLORS[entry.quality]}`}
                  title={`Quality: ${entry.quality}/5`}
                />
              )}
              {!entry && <div className="w-2.5 h-2.5" />}

              {/* Duration text */}
              <span className={`text-[10px] ${theme.textMuted} h-4`}>
                {entry ? `${Math.floor(entry.durationMinutes / 60)}h` : '—'}
              </span>

              {/* Day label */}
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? 'text-blue-500'
                    : theme.textSecondary
                }`}
              >
                {day.label}
              </span>
              <span className={`text-[10px] ${theme.textMuted}`}>{day.dayNum}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
