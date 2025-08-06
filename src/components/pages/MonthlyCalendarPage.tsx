import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
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

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105 flex items-center gap-2`}
          >
            <ArrowLeft className={`w-5 h-5 ${theme.textSecondary}`} />
            <span className={`text-sm ${theme.textSecondary}`}>Back to Weekly View</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-3 w-full">
          <Calendar className={`w-6 h-6 ${theme.textPrimary}`} />
          <h1 className={`text-3xl font-bold ${theme.textPrimary}`}>Monthly History</h1>
        </div>
        
        <div></div> {/* Spacer for flexbox */}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center mb-8">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className={`p-3 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105`}
        >
          <ChevronLeft className={`w-6 h-6 ${theme.textSecondary}`} />
        </button>
        
        <h2 className={`text-2xl font-semibold ${theme.textPrimary} mx-8 min-w-[200px] text-center`}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className={`p-3 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105`}
        >
          <ChevronRight className={`w-6 h-6 ${theme.textSecondary}`} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-7 gap-4">
          {/* Day Headers */}
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className={`text-center py-4 text-lg font-semibold ${theme.textPrimary}`}>
              {day}
            </div>
          ))}

          {/* Empty cells for days before month start */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar Days */}
          {daysInMonth.map(date => {
            const { completed, total, habits: completedHabits } = getCompletionSummaryForDay(date);
            const isToday = isSameDay(date, new Date());
            const isFuture = date > new Date();
            
            return (
              <motion.div
                key={date.toISOString()}
                className={`aspect-square p-4 rounded-2xl cursor-pointer relative ${getDayColor(date)} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } transition-all duration-200 hover:scale-105`}
                whileHover={{ scale: 1.08 }}
                onMouseEnter={() => !isFuture && setHoveredDay(date)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-xl font-semibold mb-2 ${
                    completed === total && total > 0 ? 'text-white' : 
                    completed > 0 ? 'text-white' : 
                    isToday ? theme.textPrimary : 
                    theme.isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {total > 0 && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className={`text-sm font-medium ${
                        completed === total ? 'text-white' : 
                        completed > 0 ? 'text-white' : 
                        isToday ? theme.textPrimary :
                        theme.isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {completed}/{total}
                      </div>

                      {/* Show habit icons/abbreviations */}
                      {completedHabits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {completedHabits.slice(0, 4).map(habit => (
                            <span
                              key={habit.id}
                              className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm"
                              title={habit.name}
                            >
                              {getHabitAbbreviation(habit)}
                            </span>
                          ))}
                          {completedHabits.length > 4 && (
                            <span className="text-xs bg-white/20 px-1 py-0.5 rounded backdrop-blur-sm">
                              +{completedHabits.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hover Details */}
                  {hoveredDay && isSameDay(hoveredDay, date) && total > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute top-full ${
                        // Position tooltip left or right based on screen position
                        (date.getDate() > 15) ? 'right-0' : 'left-0'
                      } mt-2 
                        ${theme.isDark ? 'bg-gray-900/95 border-gray-600' : 'bg-white/95 border-gray-200'} 
                        border rounded-lg p-3 shadow-xl z-50 min-w-[250px] pointer-events-none backdrop-blur-md`}
                    >
                      <div className={`font-semibold ${theme.textPrimary} mb-2`}>
                        {format(date, 'MMM d, yyyy')}
                      </div>
                      
                      <div className="space-y-2">
                        <div className={`text-sm ${theme.textSecondary}`}>
                          {completed} of {total} habits completed ({Math.round((completed/total) * 100)}%)
                        </div>
                        
                        {completedHabits.length > 0 && (
                          <div>
                            <div className={`text-xs ${theme.textSecondary} mb-1`}>Completed:</div>
                            <div className="flex flex-wrap gap-1">
                              {completedHabits.map(habit => (
                                <div key={habit.id} className={`text-xs ${theme.textPrimary} flex items-center gap-1 
                                  ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded-md`}>
                                  <span className="text-sm">{getHabitAbbreviation(habit)}</span>
                                  <span className="max-w-[100px] truncate">{habit.name}</span>
                                </div>
                              ))}
                            </div>
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

        {/* Legend */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
          <div className={`text-lg font-semibold ${theme.textPrimary} mb-4 text-center`}>Color Legend</div>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-700 rounded-lg"></div>
              <span className={`text-sm ${theme.textSecondary}`}>Perfect day (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
              <span className={`text-sm ${theme.textSecondary}`}>Great day (60%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-lg"></div>
              <span className={`text-sm ${theme.textSecondary}`}>Some progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-lg"></div>
              <span className={`text-sm ${theme.textSecondary}`}>Missed day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg border-2 border-blue-500`}></div>
              <span className={`text-sm ${theme.textSecondary}`}>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};