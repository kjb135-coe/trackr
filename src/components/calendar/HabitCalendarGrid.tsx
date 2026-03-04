import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { HabitV2, UserPreferencesV2 } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { logger } from '../../utils/logger';

// Debug grid alignment (dev-only, enabled via REACT_APP_DEBUG_GRID=true)
const DEBUG_GRID = process.env.NODE_ENV === 'development' && process.env.REACT_APP_DEBUG_GRID === 'true';

interface HabitCalendarGridProps {
  habits: HabitV2[];
  preferences: UserPreferencesV2;
  onToggleCompletion: (habitId: string, date: string) => void;
  onEditHabit: (habit: HabitV2) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitCalendarGrid: React.FC<HabitCalendarGridProps> = ({
  habits,
  preferences,
  onToggleCompletion,
  onEditHabit,
  onDeleteHabit
}) => {
  const theme = useThemeClasses();
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; date: string } | null>(null);
  const [habitMenuOpen, setHabitMenuOpen] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [focusedCell, setFocusedCell] = useState<{ habitIndex: number; dayIndex: number } | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const today = currentDate;
  const startDate = currentWeekStart;
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Update current date every minute to catch day/week changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (format(now, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) {
        setCurrentDate(now);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

  const isCompleted = (habit: HabitV2, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completions[dateStr]?.completed || false;
  };

  const handleCellClick = useCallback((habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onToggleCompletion(habitId, dateStr);
  }, [onToggleCompletion]);

  const isFuture = useCallback((date: Date) => {
    return date > today;
  }, [today]);

  const handleWeekNavigation = useCallback((direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      return direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1);
    });
  }, []);

  const handleTodayClick = useCallback(() => {
    const todayWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    setCurrentWeekStart(todayWeekStart);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusedCell) return;

      const { habitIndex, dayIndex } = focusedCell;
      let newHabitIndex = habitIndex;
      let newDayIndex = dayIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newHabitIndex = Math.max(0, habitIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newHabitIndex = Math.min(habits.length - 1, habitIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newDayIndex = Math.max(0, dayIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newDayIndex = Math.min(6, dayIndex + 1);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          const habit = habits[habitIndex];
          const date = days[dayIndex];
          if (habit && date && !isFuture(date)) {
            handleCellClick(habit.id, date);
          }
          break;
        case 'Escape':
          setFocusedCell(null);
          break;
      }

      if (newHabitIndex !== habitIndex || newDayIndex !== dayIndex) {
        setFocusedCell({ habitIndex: newHabitIndex, dayIndex: newDayIndex });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, habits, days, handleCellClick, isFuture]);

  const handleStartEdit = (habit: HabitV2) => {
    setEditingHabit(habit.id);
    setEditValue(habit.name);
    setHabitMenuOpen(null);
  };

  const handleSaveEdit = () => {
    if (editingHabit && editValue.trim()) {
      const habit = habits.find(h => h.id === editingHabit);
      if (habit) {
        onEditHabit({ ...habit, name: editValue.trim() });
      }
    }
    setEditingHabit(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingHabit(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const isToday = (date: Date) => {
    return isSameDay(date, today);
  };

  // Calculate weekly progress
  const calculateWeeklyProgress = () => {
    const totalPossibleCompletions = habits.length * 7;
    if (totalPossibleCompletions === 0) return { completed: 0, total: 0, percentage: 0 };

    const weeklyCompletions = days.reduce((total, day) => {
      return total + habits.filter(habit => isCompleted(habit, day)).length;
    }, 0);

    return {
      completed: weeklyCompletions,
      total: totalPossibleCompletions,
      percentage: Math.round((weeklyCompletions / totalPossibleCompletions) * 100)
    };
  };

  const weeklyProgress = calculateWeeklyProgress();

  // Debug grid alignment (dev-only)
  useEffect(() => {
    if (!DEBUG_GRID) return;

    const checkAlignment = () => {
      const headerCells = Array.from(document.querySelectorAll('[data-grid=header] [data-col=day]')) as HTMLElement[];
      const firstRowCells = Array.from(document.querySelectorAll('[data-grid=row]:first-of-type [data-col=day]')) as HTMLElement[];

      headerCells.forEach((hd, i) => {
        const bd = firstRowCells[i];
        if (!bd) return;
        const x1 = Math.round(hd.getBoundingClientRect().left);
        const x2 = Math.round(bd.getBoundingClientRect().left);
        if (Math.abs(x1 - x2) > 1 && DEBUG_GRID) {
          logger.warn('HabitCalendarGrid', `Grid misalignment at column ${i}`, { headerLeft: x1, bodyLeft: x2 });
        }
      });
    };

    const timer = setTimeout(checkAlignment, 100);
    window.addEventListener('resize', checkAlignment);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkAlignment);
    };
  }, [habits.length]);

  const todayColBg = theme.isDark ? 'bg-blue-500/5' : 'bg-blue-50/50';

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-semibold ${theme.textPrimary}`}>
            Keegan's Trackr
          </h1>
        </div>

        {/* Conditional Progress Bar - only show when goal is set */}
        {preferences.weeklyGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm ${theme.textSecondary}`}>
                {weeklyProgress.completed}/{weeklyProgress.total} completed
              </div>
              <div className={`text-sm font-medium ${theme.textPrimary}`}>
                Weekly goal: {preferences.weeklyGoal}%
              </div>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.5,
                    delay: 1,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Calendar Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className={`${theme.card} overflow-hidden shadow-xl`}
        style={{
          '--accent': theme.isDark ? '#60a5fa' : '#3b82f6',
        } as React.CSSProperties}
      >
        {/* Week Navigation Row */}
        <div className={`border-b ${theme.isDark ? 'border-slate-700' : 'border-gray-200'} ${theme.isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center py-3">
            <button
              onClick={() => handleWeekNavigation('prev')}
              aria-label="Previous week"
              className={`p-2 ${theme.btnTertiary} rounded-lg mr-4`}
            >
              ←
            </button>
            <span className={`text-lg font-medium ${theme.textPrimary} min-w-[140px] text-center`}>
              {format(startDate, 'MMM d')}–{format(addDays(startDate, 6), 'd')}
            </span>
            <button
              onClick={() => handleWeekNavigation('next')}
              aria-label="Next week"
              className={`p-2 ${theme.btnTertiary} rounded-lg ml-4`}
            >
              →
            </button>
            <button
              onClick={handleTodayClick}
              className={`ml-4 px-3 py-1 text-sm ${theme.isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} hover:underline transition-colors`}
            >
              Today
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '180px' }} />
            {days.map((date) => (
              <col key={date.toISOString()} />
            ))}
          </colgroup>
          <thead>
            <tr className={`border-b ${theme.isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`} data-grid="header">
              <th className={`px-4 py-3 text-left font-medium ${theme.textPrimary}`}>
                Habits
              </th>
              {days.map((date) => (
                <th
                  key={date.toISOString()}
                  className={`px-2 py-3 text-center font-medium transition-all duration-200 ${
                    isToday(date)
                      ? `${theme.isDark ? 'text-blue-300 bg-blue-900/20' : 'text-blue-700 bg-blue-50/80'}`
                      : theme.textSecondary
                  }`}
                  data-col="day"
                >
                  <div className="text-xs uppercase tracking-wider mb-1 opacity-75">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-base font-semibold ${isToday(date) ? (theme.isDark ? 'text-blue-300' : 'text-blue-700') : ''}`}>
                    {format(date, 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {habits.map((habit, habitIndex) => (
                <motion.tr
                  key={habit.id}
                  data-habit-id={habit.id}
                  data-grid="row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: habitIndex * 0.05 }}
                  className={`border-b last:border-b-0 ${theme.isDark ? 'border-slate-700/50' : 'border-gray-100'} group hover:${theme.isDark ? 'bg-slate-750' : 'bg-gray-50/50'} transition-colors duration-200`}
                >
                  {/* Habit Name Cell */}
                  <td className={`px-4 py-2 ${theme.isDark ? 'bg-slate-800' : 'bg-white'} relative`}>
                    {editingHabit === habit.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyPress}
                        className={`${theme.input} w-full font-medium`}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center justify-between min-h-[40px]">
                        <span className={`${theme.textPrimary} font-semibold text-lg truncate`}>
                          {habit.name}
                        </span>
                        <div className="relative flex-shrink-0 ml-2">
                          <button
                            onClick={() => setHabitMenuOpen(habitMenuOpen === habit.id ? null : habit.id)}
                            aria-label={`Options for ${habit.name}`}
                            className={`opacity-0 group-hover:opacity-100 p-1.5 ${theme.hoverBg} rounded-lg transition-all duration-200 hover:scale-105`}
                          >
                            <MoreHorizontal className={`w-4 h-4 ${theme.textMuted}`} />
                          </button>

                          <AnimatePresence>
                            {habitMenuOpen === habit.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute right-0 bottom-full mb-2 ${theme.card} py-2 z-50 min-w-[140px] shadow-2xl`}
                              >
                                <button
                                  onClick={() => handleStartEdit(habit)}
                                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${theme.textPrimary} ${theme.hoverBg} transition-colors`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit Name
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteHabit(habit.id);
                                    setHabitMenuOpen(null);
                                  }}
                                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${theme.isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Day Cells */}
                  {days.map((date, dayIndex) => {
                    const completed = isCompleted(habit, date);
                    const future = isFuture(date);
                    const cellKey = `${habit.id}-${format(date, 'yyyy-MM-dd')}`;
                    const isHovered = hoveredCell?.habitId === habit.id && hoveredCell?.date === format(date, 'yyyy-MM-dd');
                    const isFocused = focusedCell?.habitIndex === habitIndex && focusedCell?.dayIndex === dayIndex;

                    return (
                      <td
                        key={cellKey}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={completed}
                        aria-label={`${habit.name}, ${format(date, 'EEEE MMM d')}`}
                        className={`cell px-1 py-2 text-center cursor-pointer relative transition-colors duration-200 ${
                          future ? 'cursor-not-allowed opacity-40' : ''
                        } ${isToday(date) ? todayColBg : ''}`}
                        data-col="day"
                        onClick={() => {
                          if (!future) {
                            handleCellClick(habit.id, date);
                            setFocusedCell({ habitIndex, dayIndex });
                          }
                        }}
                        onFocus={() => setFocusedCell({ habitIndex, dayIndex })}
                        onMouseEnter={() => !future && setHoveredCell({ habitId: habit.id, date: format(date, 'yyyy-MM-dd') })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div className="flex items-center justify-center">
                          <motion.div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border-2 ${
                              completed
                                ? 'bg-blue-500 border-blue-500'
                                : (isHovered || isFocused)
                                ? `border-blue-400 bg-blue-500/10`
                                : `border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500`
                            } shadow-sm hover:shadow-md`}
                            initial={false}
                            animate={{
                              scale: completed ? 1.05 : 1,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30
                            }}
                            whileHover={!future ? { scale: 1.02 } : {}}
                            whileTap={!future ? { scale: 0.98 } : {}}
                          >
                            <AnimatePresence mode="wait">
                              {completed && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                  <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Enhanced Empty State */}
        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-16 text-center"
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              🌱
            </motion.div>
            <h3 className={`text-2xl font-semibold ${theme.textPrimary} mb-3`}>
              Ready to build great habits?
            </h3>
            <p className={`${theme.textSecondary} text-base mb-8 max-w-md mx-auto`}>
              Start tracking daily habits. Use the gear icon to add your first habit.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Click outside to close menus */}
      {habitMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setHabitMenuOpen(null)}
        />
      )}
    </div>
  );
};
