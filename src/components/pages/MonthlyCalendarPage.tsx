import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { HabitV2 } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface MonthlyCalendarPageProps {
  habits: HabitV2[];
  onBack: () => void;
  installDate?: Date;
}

export const MonthlyCalendarPage: React.FC<MonthlyCalendarPageProps> = ({ habits, onBack, installDate }) => {
  const theme = useThemeClasses();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isCompleted = (habit: HabitV2, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completions[dateStr]?.completed || false;
  };

  const getCompletionSummaryForDay = (date: Date) => {
    const completedHabits = habits.filter(habit => isCompleted(habit, date));
    const totalHabits = habits.length;
    return { completed: completedHabits.length, total: totalHabits, habits: completedHabits };
  };

  const getHabitAbbreviation = (habit: HabitV2) => {
    if (habit.emoji && habit.emoji.trim()) {
      return habit.emoji;
    }
    const words = habit.name.toUpperCase().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2);
    }
    return words.slice(0, 2).map(word => word.charAt(0)).join('');
  };

  const getDayColor = (date: Date) => {
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isFuture = date > today;
    
    // Future days and current day should have no color (gray/transparent)
    if (isFuture || isToday) {
      return theme.isDark ? 'bg-gray-700/50' : 'bg-gray-200/50';
    }
    
    // Only apply coloring to dates after installation
    const appInstallDate = installDate || new Date();
    if (date < appInstallDate) {
      return theme.isDark ? 'bg-gray-700/50' : 'bg-gray-200/50';
    }
    
    const { completed, total } = getCompletionSummaryForDay(date);
    
    // Days with no habits tracked should have no color
    if (total === 0) {
      return theme.isDark ? 'bg-gray-700/50' : 'bg-gray-200/50';
    }
    
    const percentage = completed / total;
    
    // Only past days get colored based on completion
    if (completed === 0) return 'bg-red-500';
    if (percentage === 1) return 'bg-green-700';
    if (percentage > 0.6) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="min-h-screen p-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`${theme.btnSecondary} text-sm flex items-center gap-2`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Weekly
          </button>
          <button
            onClick={goToCurrentMonth}
            className={`${theme.btnTertiary} text-sm`}
          >
            Today
          </button>
        </div>
        
        <h1 className={`text-xl font-semibold ${theme.textPrimary}`}>
          Monthly View
        </h1>
        
        <div className="w-32"></div> {/* Spacer for balance */}
      </div>

      {/* Compact Month Navigation */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className={`${theme.btnTertiary} p-2`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h2 className={`text-lg font-medium ${theme.textPrimary} min-w-[150px] text-center`}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className={`${theme.btnTertiary} p-2`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Optional: Month Dropdown for Quick Navigation */}
      <div className="flex justify-center mb-6">
        <select
          value={format(currentMonth, 'yyyy-MM')}
          onChange={(e) => setCurrentMonth(new Date(e.target.value + '-01'))}
          className={`${theme.input} text-sm max-w-[160px]`}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const date = subMonths(new Date(), 6 - i);
            return (
              <option key={i} value={format(date, 'yyyy-MM')}>
                {format(date, 'MMM yyyy')}
              </option>
            );
          })}
        </select>
      </div>

      {/* Dense Calendar Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-7 gap-2">
          {/* Compact Day Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className={`text-center py-2 text-sm font-medium ${theme.textSecondary} uppercase tracking-wider`}>
              {day}
            </div>
          ))}

          {/* Empty cells for days before month start */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square min-h-[80px]" />
          ))}

          {/* Calendar Days */}
          {daysInMonth.map(date => {
            const { completed, total, habits: completedHabits } = getCompletionSummaryForDay(date);
            const isToday = isSameDay(date, new Date());
            const isFuture = date > new Date();
            
            return (
              <motion.div
                key={date.toISOString()}
                className={`aspect-square min-h-[80px] p-2 rounded-lg cursor-pointer relative ${getDayColor(date)} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } transition-all duration-200 hover:scale-102`}
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => !isFuture && setHoveredDay(date)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-base font-semibold mb-1 ${
                    completed === total && total > 0 ? 'text-white' : 
                    completed > 0 ? 'text-white' : 
                    isToday ? theme.textPrimary : 
                    theme.isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {total > 0 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className={`text-xs font-medium ${
                        completed === total ? 'text-white' : 
                        completed > 0 ? 'text-white' : 
                        isToday ? theme.textPrimary :
                        theme.isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {completed}/{total}
                      </div>

                      {/* Compact habit indicators */}
                      {completedHabits.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {completedHabits.slice(0, 3).map(habit => (
                            <span
                              key={habit.id}
                              className="text-xs bg-white/20 px-1 py-0.5 rounded text-[10px] backdrop-blur-sm"
                              title={habit.name}
                            >
                              {getHabitAbbreviation(habit)}
                            </span>
                          ))}
                          {completedHabits.length > 3 && (
                            <span className="text-xs bg-white/20 px-1 py-0.5 rounded text-[10px] backdrop-blur-sm">
                              +{completedHabits.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Repositioned Hover Details */}
                  {hoveredDay && isSameDay(hoveredDay, date) && total > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute top-full ${
                        // Better positioning logic
                        (date.getDate() > 15) ? 'right-0' : 'left-0'
                      } mt-1 
                        ${theme.isDark ? 'bg-gray-900/95 border-gray-600' : 'bg-white/95 border-gray-200'} 
                        border rounded-lg p-2 shadow-xl z-50 min-w-[200px] pointer-events-none backdrop-blur-md`}
                    >
                      <div className={`font-medium ${theme.textPrimary} mb-1 text-sm`}>
                        {format(date, 'MMM d')}
                      </div>
                      
                      <div className="space-y-1">
                        <div className={`text-xs ${theme.textSecondary}`}>
                          {completed}/{total} habits ({Math.round((completed/total) * 100)}%)
                        </div>
                        
                        {completedHabits.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {completedHabits.map(habit => (
                              <div key={habit.id} className={`text-xs ${theme.textPrimary} flex items-center gap-1 
                                ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'} px-1 py-0.5 rounded text-[10px]`}>
                                <span>{getHabitAbbreviation(habit)}</span>
                                <span className="max-w-[60px] truncate">{habit.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Compact Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-sm font-medium ${theme.textPrimary} mb-3 text-center`}>Legend</div>
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-700 rounded"></div>
              <span className={`${theme.textSecondary}`}>100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className={`${theme.textSecondary}`}>60%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className={`${theme.textSecondary}`}>Some</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className={`${theme.textSecondary}`}>Missed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};