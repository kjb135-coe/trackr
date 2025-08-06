import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { HabitV2 } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface MonthlyCalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitV2[];
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ isOpen, onClose, habits }) => {
  const theme = useThemeClasses();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

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
    // Create abbreviation from habit name (like iOS contacts)
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
      return theme.isDark ? 'bg-gray-700' : 'bg-gray-200';
    }
    
    const { completed, total } = getCompletionSummaryForDay(date);
    
    // Days with no habits tracked should have no color
    if (total === 0) {
      return theme.isDark ? 'bg-gray-700' : 'bg-gray-200';
    }
    
    const percentage = completed / total;
    
    // Only past days get colored based on completion
    if (completed === 0) return 'bg-red-500'; // 0 habits completed = red
    if (percentage === 1) return 'bg-green-700'; // 100% = dark green
    if (percentage > 0.6) return 'bg-green-500'; // >60% = green
    return 'bg-yellow-500'; // at least one = yellow
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`${theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
            border rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className={`w-6 h-6 ${theme.textPrimary}`} />
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Monthly View</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105`}
          >
            <X className={`w-5 h-5 ${theme.textSecondary}`} />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className={`p-2 ${theme.hoverBg} rounded-lg transition-colors`}
          >
            <ChevronLeft className={`w-5 h-5 ${theme.textSecondary}`} />
          </button>
          
          <h3 className={`text-xl font-semibold ${theme.textPrimary}`}>
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className={`p-2 ${theme.hoverBg} rounded-lg transition-colors`}
          >
            <ChevronRight className={`w-5 h-5 ${theme.textSecondary}`} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className={`text-center py-2 text-sm font-medium ${theme.textSecondary}`}>
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
                className={`aspect-square p-2 rounded-lg cursor-pointer relative ${getDayColor(date)} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } ${isFuture ? 'opacity-50' : ''}`}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={(e) => {
                  if (!isFuture) {
                    setHoveredDay(date);
                    setMousePosition({ x: e.clientX, y: e.clientY });
                    // Small delay to prevent flickering
                    setTimeout(() => setShowTooltip(true), 100);
                  }
                }}
                onMouseMove={(e) => {
                  if (hoveredDay && isSameDay(hoveredDay, date) && !isFuture) {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredDay(null);
                  setShowTooltip(false);
                }}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm font-medium ${
                    completed === total && total > 0 ? 'text-white' : 
                    completed > 0 ? 'text-white' : 
                    theme.isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  
                  {total > 0 && (
                    <div className="mt-auto">
                      <div className={`text-xs ${
                        completed === total ? 'text-white' : 
                        completed > 0 ? 'text-white' : 
                        theme.isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {completed}/{total}
                      </div>
                    </div>
                  )}

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredDay && isSameDay(hoveredDay, date) && showTooltip && total > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`fixed ${theme.isDark ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-200'} 
                          border rounded-lg p-3 shadow-xl z-50 min-w-[220px] max-w-[280px] pointer-events-none`}
                        style={{
                          left: Math.min(window.innerWidth - 300, Math.max(20, mousePosition.x - 140)),
                          top: Math.max(20, mousePosition.y - 140),
                          transform: 'translateZ(0)' // Force GPU acceleration for smoother rendering
                        }}
                      >
                        <div className={`font-semibold ${theme.textPrimary} mb-2`}>
                          {format(date, 'MMM d, yyyy')}
                        </div>
                        
                        {total === 0 ? (
                          <div className={`text-sm ${theme.textSecondary}`}>
                            No habits tracked
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className={`text-sm ${theme.textSecondary}`}>
                              {completed} of {total} habits completed ({Math.round((completed/total) * 100)}%)
                            </div>
                            
                            {completedHabits.length > 0 && (
                              <div>
                                <div className={`text-xs ${theme.textSecondary} mb-1`}>Completed:</div>
                                <div className="flex flex-wrap gap-1">
                                  {completedHabits.slice(0, 4).map(habit => (
                                    <div key={habit.id} className={`text-xs ${theme.textPrimary} flex items-center gap-1 
                                      ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2 py-1 rounded-md`}>
                                      <span className="text-sm">{getHabitAbbreviation(habit)}</span>
                                      <span className="truncate max-w-[100px]">{habit.name}</span>
                                    </div>
                                  ))}
                                </div>
                                {completedHabits.length > 4 && (
                                  <div className={`text-xs ${theme.textSecondary} mt-1`}>
                                    +{completedHabits.length - 4} more
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Show incomplete habits */}
                            {completed < total && (
                              <div>
                                <div className={`text-xs ${theme.textSecondary} mb-1`}>Remaining:</div>
                                <div className="flex flex-wrap gap-1">
                                  {habits.filter(habit => !isCompleted(habit, date)).slice(0, 3).map(habit => (
                                    <div key={habit.id} className={`text-xs ${theme.textSecondary} flex items-center gap-1 
                                      ${theme.isDark ? 'bg-gray-800' : 'bg-gray-50'} px-2 py-1 rounded-md opacity-60`}>
                                      <span className="text-sm">{getHabitAbbreviation(habit)}</span>
                                      <span className="truncate max-w-[80px]">{habit.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-sm font-medium ${theme.textSecondary} mb-2`}>Completion Rate</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-700 rounded"></div>
              <span className={`text-xs ${theme.textSecondary}`}>All habits (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className={`text-xs ${theme.textSecondary}`}>Most habits ({'>'}60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className={`text-xs ${theme.textSecondary}`}>Some habits (today: always yellow+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className={`text-xs ${theme.textSecondary}`}>No habits (past days only)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
              <span className={`text-xs ${theme.textSecondary}`}>Future days / No habits tracked</span>
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};