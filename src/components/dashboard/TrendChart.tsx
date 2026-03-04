import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { DailyDataPoint } from './useDashboardData';

interface TrendChartProps {
  dailyData: DailyDataPoint[];
  rollingAverage: number[];
}

const CHART_HEIGHT = 160;
const BAR_MIN_WIDTH = 4;
const BAR_MAX_WIDTH = 24;
const PADDING = { top: 20, right: 12, bottom: 28, left: 36 };

export const TrendChart: React.FC<TrendChartProps> = React.memo(({ dailyData, rollingAverage }) => {
  const theme = useThemeClasses();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (dailyData.length === 0) return null;

  const totalWidth = 600;
  const chartWidth = totalWidth - PADDING.left - PADDING.right;
  const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const barWidth = Math.max(
    BAR_MIN_WIDTH,
    Math.min(BAR_MAX_WIDTH, (chartWidth / dailyData.length) * 0.7)
  );
  const barGap = (chartWidth - barWidth * dailyData.length) / Math.max(1, dailyData.length - 1);

  const getX = (i: number) => PADDING.left + i * (barWidth + barGap);
  const getY = (pct: number) => PADDING.top + chartHeight - (pct / 100) * chartHeight;

  // Build rolling average path
  const linePath = rollingAverage
    .map((val, i) => {
      const x = getX(i) + barWidth / 2;
      const y = getY(val);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  // X-axis labels — show a subset
  const labelEvery = dailyData.length <= 14 ? 2 : dailyData.length <= 30 ? 5 : 10;

  return (
    <div
      className={`p-4 rounded-lg ${
        theme.isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'
      } border`}
    >
      <h3 className={`text-sm font-medium ${theme.textSecondary} mb-3`}>Completion Trend</h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalWidth} ${CHART_HEIGHT}`}
          className="w-full"
          style={{ minWidth: Math.max(300, dailyData.length * 8) }}
        >
          {/* Y-axis gridlines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line
                x1={PADDING.left}
                x2={totalWidth - PADDING.right}
                y1={getY(pct)}
                y2={getY(pct)}
                stroke={theme.isDark ? '#374151' : '#e5e7eb'}
                strokeWidth={0.5}
              />
              <text
                x={PADDING.left - 4}
                y={getY(pct) + 3}
                textAnchor="end"
                className={`text-[9px] ${theme.isDark ? 'fill-gray-500' : 'fill-gray-400'}`}
              >
                {pct}%
              </text>
            </g>
          ))}

          {/* Bars */}
          {dailyData.map((d, i) => (
            <motion.rect
              key={d.date}
              x={getX(i)}
              y={getY(d.percentage)}
              width={barWidth}
              height={Math.max(0, (d.percentage / 100) * chartHeight)}
              rx={Math.min(2, barWidth / 2)}
              fill={theme.isDark ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.3)'}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.01, duration: 0.3 }}
              style={{ transformOrigin: `${getX(i) + barWidth / 2}px ${PADDING.top + chartHeight}px` }}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Rolling average line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* X-axis labels */}
          {dailyData.map((d, i) =>
            i % labelEvery === 0 ? (
              <text
                key={`label-${d.date}`}
                x={getX(i) + barWidth / 2}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                className={`text-[9px] ${theme.isDark ? 'fill-gray-500' : 'fill-gray-400'}`}
              >
                {format(parseISO(d.date), 'M/d')}
              </text>
            ) : null
          )}

          {/* Hover tooltip */}
          {hoveredIdx !== null && (
            <g>
              <rect
                x={getX(hoveredIdx) + barWidth / 2 - 36}
                y={getY(dailyData[hoveredIdx].percentage) - 28}
                width={72}
                height={22}
                rx={4}
                fill={theme.isDark ? '#374151' : '#1f2937'}
              />
              <text
                x={getX(hoveredIdx) + barWidth / 2}
                y={getY(dailyData[hoveredIdx].percentage) - 14}
                textAnchor="middle"
                className="text-[10px] fill-white font-medium"
              >
                {format(parseISO(dailyData[hoveredIdx].date), 'MMM d')}: {dailyData[hoveredIdx].percentage}%
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
});

TrendChart.displayName = 'TrendChart';
