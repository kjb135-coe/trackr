import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { HabitV2, UserPreferencesV2 } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

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

  const today = currentDate;
  const startDate = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Update current date every minute to catch day/week changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Only update if the date actually changed (to avoid unnecessary re-renders)
      if (format(now, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) {
        setCurrentDate(now);
      }
    }, 60000); // Check every minute

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

  // const getTimeBasedGreeting = () => {
  //   const hour = currentDate.getHours();
  //   if (hour < 12) return { text: 'Good morning', icon: Sun };
  //   if (hour < 17) return { text: 'Good afternoon', icon: Sun };
  //   if (hour < 21) return { text: 'Good evening', icon: Cloud };
  //   return { text: 'Good night', icon: Moon };
  // };

  // const { icon: GreetingIcon } = getTimeBasedGreeting();

  // Calculate weekly progress
  const calculateWeeklyProgress = () => {
    const totalPossibleCompletions = habits.length * 7; // 7 days per week
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
          
          {/* Compact Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className={`text-sm ${theme.textSecondary}`}>
              {weeklyProgress.completed}/{weeklyProgress.total}
            </div>
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className={`text-sm font-medium ${theme.textPrimary}`}>
              {weeklyProgress.percentage}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Calendar Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className={`${theme.card} overflow-hidden shadow-xl`}
      >
        {/* Header Row with Week Navigation */}
        <div className={`grid grid-cols-8 border-b ${theme.calendarHeader}`}>
          <div className={`p-4 font-medium ${theme.textPrimary} flex items-center justify-between`}>
            <span>Habits</span>
            <div className="flex items-center gap-2 text-sm">
              <button className={`p-1 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
                ←
              </button>
              <span className={theme.textSecondary}>
                {format(startDate, 'MMM d')}–{format(addDays(startDate, 6), 'd')}
              </span>
              <button className={`p-1 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
                →
              </button>
              <button className={`ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors`}>
                Today
              </button>
            </div>
          </div>
          {days.map((date) => (
            <div
              key={date.toISOString()}
              className={`p-4 text-center border-l ${theme.calendarCell} font-medium transition-all duration-200 ${
                isToday(date) 
                  ? `${theme.calendarToday} ${theme.isDark ? 'text-blue-300' : 'text-blue-700'}`
                  : theme.textSecondary
              }`}
            >
              <div className="text-xs uppercase tracking-wider mb-1 opacity-75">
                {format(date, 'EEE')}
              </div>
              <div className={`text-base font-semibold ${isToday(date) ? (theme.isDark ? 'text-blue-300' : 'text-blue-700') : ''}`}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Habit Rows */}
        <AnimatePresence mode="popLayout">
          {habits.map((habit, habitIndex) => (
            <motion.div
              key={habit.id}
              data-habit-id={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: habitIndex * 0.05 }}
              className={`grid grid-cols-8 border-b last:border-b-0 ${theme.calendarCell} group hover:shadow-sm transition-all duration-200`}
            >
              {/* Habit Name Cell */}
              <div className={`p-4 border-r ${theme.calendarCell} relative`}>
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
                  <div className="flex items-center justify-between">
                    <span className={`${theme.textPrimary} font-semibold text-lg`}>
                      {habit.name}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setHabitMenuOpen(habitMenuOpen === habit.id ? null : habit.id)}
                        className={`opacity-0 group-hover:opacity-100 p-2 ${theme.hoverBg} rounded-lg transition-all duration-200 hover:scale-105`}
                      >
                        <MoreHorizontal className={`w-5 h-5 ${theme.textMuted}`} />
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
              </div>

              {/* Day Cells */}
              {days.map((date, dayIndex) => {
                const completed = isCompleted(habit, date);
                const future = isFuture(date);
                const cellKey = `${habit.id}-${format(date, 'yyyy-MM-dd')}`;
                const isHovered = hoveredCell?.habitId === habit.id && hoveredCell?.date === format(date, 'yyyy-MM-dd');
                const isFocused = focusedCell?.habitIndex === habitIndex && focusedCell?.dayIndex === dayIndex;
                
                return (
                  <motion.div
                    key={cellKey}
                    tabIndex={0}
                    className={`p-4 border-l ${theme.calendarCell} flex items-center justify-center cursor-pointer relative transition-all duration-200 min-h-[48px] ${
                      future ? 'cursor-not-allowed opacity-40' : ''
                    } ${isToday(date) ? 'bg-blue-500/5 dark:bg-blue-400/5' : ''} ${
                      isFocused ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                    }`}
                    onClick={() => {
                      if (!future) {
                        handleCellClick(habit.id, date);
                        setFocusedCell({ habitIndex, dayIndex });
                      }
                    }}
                    onFocus={() => setFocusedCell({ habitIndex, dayIndex })}
                    onMouseEnter={() => !future && setHoveredCell({ habitId: habit.id, date: format(date, 'yyyy-MM-dd') })}
                    onMouseLeave={() => setHoveredCell(null)}
                    whileHover={!future ? { scale: 1.02 } : {}}
                    whileTap={!future ? { scale: 0.98 } : {}}
                  >
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
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>

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