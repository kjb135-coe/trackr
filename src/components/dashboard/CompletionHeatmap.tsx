import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { HeatmapDay } from './useDashboardData';

interface CompletionHeatmapProps {
  data: HeatmapDay[];
}

const ROWS = 7; // Mon-Sun
const COLS = 13; // 13 weeks
const CELL_SIZE = 14;
const CELL_GAP = 3;
const LABEL_WIDTH = 24;
const HEADER_HEIGHT = 18;

const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

function getColor(percentage: number, isDark: boolean): string {
  if (percentage < 0) return isDark ? '#1e293b' : '#f1f5f9'; // no habits
  if (percentage === 0) return isDark ? '#374151' : '#e5e7eb';
  if (percentage <= 25) return isDark ? '#166534' : '#bbf7d0';
  if (percentage <= 50) return isDark ? '#15803d' : '#86efac';
  if (percentage <= 75) return isDark ? '#16a34a' : '#4ade80';
  return isDark ? '#22c55e' : '#22c55e';
}

export const CompletionHeatmap: React.FC<CompletionHeatmapProps> = React.memo(({ data }) => {
  const theme = useThemeClasses();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: HeatmapDay } | null>(null);

  const svgWidth = LABEL_WIDTH + COLS * (CELL_SIZE + CELL_GAP);
  const svgHeight = HEADER_HEIGHT + ROWS * (CELL_SIZE + CELL_GAP);

  // Compute month labels from the data
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = '';
  for (let col = 0; col < COLS; col++) {
    const idx = col * 7; // first day of each week column
    if (idx < data.length) {
      const month = format(parseISO(data[idx].date), 'MMM');
      if (month !== lastMonth) {
        monthLabels.push({ label: month, col });
        lastMonth = month;
      }
    }
  }

  return (
    <div
      className={`p-4 rounded-lg ${
        theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
      } border`}
    >
      <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Activity</h3>
      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: svgWidth }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full"
            style={{ maxWidth: svgWidth }}
          >
            {/* Month labels */}
            {monthLabels.map(({ label, col }) => (
              <text
                key={`month-${col}`}
                x={LABEL_WIDTH + col * (CELL_SIZE + CELL_GAP)}
                y={12}
                className={`text-[10px] ${theme.isDark ? 'fill-gray-500' : 'fill-gray-400'}`}
              >
                {label}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((label, row) =>
              label ? (
                <text
                  key={`day-${row}`}
                  x={0}
                  y={HEADER_HEIGHT + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                  className={`text-[10px] ${theme.isDark ? 'fill-gray-500' : 'fill-gray-400'}`}
                >
                  {label}
                </text>
              ) : null
            )}

            {/* Cells — data is organized as [week0-mon, week0-tue, ..., week0-sun, week1-mon, ...] */}
            {data.map((day, i) => {
              const col = Math.floor(i / 7);
              const row = i % 7;
              const x = LABEL_WIDTH + col * (CELL_SIZE + CELL_GAP);
              const y = HEADER_HEIGHT + row * (CELL_SIZE + CELL_GAP);
              const isFuture = day.date > format(new Date(), 'yyyy-MM-dd');

              return (
                <motion.rect
                  key={day.date}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={2}
                  fill={isFuture ? 'transparent' : getColor(day.percentage, theme.isDark)}
                  stroke={isFuture ? (theme.isDark ? '#374151' : '#e5e7eb') : 'none'}
                  strokeWidth={isFuture ? 0.5 : 0}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isFuture ? 0.3 : 1 }}
                  transition={{ delay: col * 0.02 }}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    if (!isFuture) {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect();
                      setTooltip({ x: rect.left + rect.width / 2, y: rect.top, day });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className={`fixed z-50 px-2 py-1 text-xs rounded shadow-lg pointer-events-none ${
                theme.isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-900 text-white'
              }`}
              style={{
                left: tooltip.x,
                top: tooltip.y - 32,
                transform: 'translateX(-50%)',
              }}
            >
              {format(parseISO(tooltip.day.date), 'MMM d')}: {tooltip.day.completed}/{tooltip.day.total} ({tooltip.day.percentage >= 0 ? `${tooltip.day.percentage}%` : 'N/A'})
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className={`text-[10px] ${theme.textMuted} mr-1`}>Less</span>
        {[
          theme.isDark ? '#374151' : '#e5e7eb',
          theme.isDark ? '#166534' : '#bbf7d0',
          theme.isDark ? '#15803d' : '#86efac',
          theme.isDark ? '#16a34a' : '#4ade80',
          theme.isDark ? '#22c55e' : '#22c55e',
        ].map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className={`text-[10px] ${theme.textMuted} ml-1`}>More</span>
      </div>
    </div>
  );
});

CompletionHeatmap.displayName = 'CompletionHeatmap';
