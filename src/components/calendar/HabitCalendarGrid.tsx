import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Edit2, Trash2, Sun, Moon, Cloud } from 'lucide-react';
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

  const today = currentDate;
  const startDate = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const isCompleted = (habit: HabitV2, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completions[dateStr]?.completed || false;
  };

  const handleCellClick = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onToggleCompletion(habitId, dateStr);
  };

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

  const isFuture = (date: Date) => {
    return date > today;
  };

  const isToday = (date: Date) => {
    return isSameDay(date, today);
  };

  const getTimeBasedGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun };
    if (hour < 17) return { text: 'Good afternoon', icon: Sun };
    if (hour < 21) return { text: 'Good evening', icon: Cloud };
    return { text: 'Good night', icon: Moon };
  };


  const { icon: GreetingIcon } = getTimeBasedGreeting();

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
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-10"
      >
        {/* Greeting Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <div className={`p-2 ${theme.isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full`}>
              <GreetingIcon className={`w-6 h-6 ${theme.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-4xl font-semibold ${theme.textPrimary}`}>
              Keegan's Trackr
            </h1>
          </motion.div>
          
        </div>
        
        {/* Weekly Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`${theme.isDark ? 
            'bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-gray-700/30 border-gray-600/50' : 
            'bg-gradient-to-br from-white/90 via-blue-50/60 to-purple-50/40 border-gray-200/60'
          } border rounded-xl p-3 mb-6 backdrop-blur-md shadow-lg max-w-3xl mx-auto`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full shadow-sm ${
                weeklyProgress.percentage >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 
                weeklyProgress.percentage >= 60 ? 'bg-gradient-to-br from-blue-400 to-indigo-600' : 
                weeklyProgress.percentage >= 40 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}></div>
              <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>Weekly Progress</h3>
            </div>
            <div className={`text-lg font-bold ${
              weeklyProgress.percentage >= 80 ? 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text' : 
              weeklyProgress.percentage >= 60 ? 'text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text' : 
              weeklyProgress.percentage >= 40 ? 'text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text' : 
              'text-transparent bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text'
            }`}>
              {weeklyProgress.percentage}%
            </div>
          </div>
          
          <div className={`w-full h-3 ${theme.isDark ? 'bg-gray-700/60' : 'bg-gray-200/80'} rounded-full overflow-hidden mb-2 shadow-inner`}>
            <motion.div
              className={`h-full rounded-full relative overflow-hidden shadow-md ${
                weeklyProgress.percentage >= 80 ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 shadow-green-500/30' : 
                weeklyProgress.percentage >= 60 ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 shadow-blue-500/30' : 
                weeklyProgress.percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 shadow-yellow-500/30' : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress.percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
            >
              {/* Enhanced animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 2, 
                  delay: 2,
                  ease: "easeInOut"
                }}
              />
              
              {/* Subtle pulse for high progress */}
              {weeklyProgress.percentage >= 80 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-300/20 to-emerald-300/20"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className={`${theme.textSecondary} font-medium`}>
              {weeklyProgress.completed}/{weeklyProgress.total} completed
            </span>
            <span className={`font-medium ${
              weeklyProgress.percentage >= (preferences.weeklyGoal || 85) ? 'text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text' : theme.textSecondary
            }`}>
              Goal: {preferences.weeklyGoal || 85}% • {Math.max(0, Math.ceil(weeklyProgress.total * ((preferences.weeklyGoal || 85) / 100)) - weeklyProgress.completed)} to go
            </span>
          </div>
        </motion.div>
        
        {/* Title */}
        <div className="text-center">
          <motion.h2 
            className={`text-2xl font-semibold ${theme.textPrimary}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            This Week
          </motion.h2>
        </div>
      </motion.div>

      {/* Enhanced Calendar Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className={`${theme.card} overflow-hidden shadow-xl`}
      >
        {/* Header Row */}
        <div className={`grid grid-cols-8 border-b ${theme.calendarHeader}`}>
          <div className={`p-6 font-semibold ${theme.textPrimary} text-lg`}>
            Habits
          </div>
          {days.map((date) => (
            <div
              key={date.toISOString()}
              className={`p-6 text-center border-l ${theme.calendarCell} font-medium transition-all duration-200 ${
                isToday(date) 
                  ? `${theme.calendarToday} ${theme.isDark ? 'text-blue-300' : 'text-blue-700'}`
                  : theme.textSecondary
              }`}
            >
              <div className="text-xs uppercase tracking-wider mb-1 opacity-75">
                {format(date, 'EEE')}
              </div>
              <div className={`text-lg font-semibold ${isToday(date) ? (theme.isDark ? 'text-blue-300' : 'text-blue-700') : ''}`}>
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
              <div className={`p-6 border-r ${theme.calendarCell} relative`}>
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
                
                return (
                  <motion.div
                    key={cellKey}
                    className={`p-6 border-l ${theme.calendarCell} flex items-center justify-center cursor-pointer relative transition-all duration-200 ${
                      future ? 'cursor-not-allowed opacity-40' : ''
                    } ${isToday(date) ? theme.calendarToday : ''}`}
                    onClick={() => !future && handleCellClick(habit.id, date)}
                    onMouseEnter={() => !future && setHoveredCell({ habitId: habit.id, date: format(date, 'yyyy-MM-dd') })}
                    onMouseLeave={() => setHoveredCell(null)}
                    whileHover={!future ? { scale: 1.05 } : {}}
                    whileTap={!future ? { scale: 0.95 } : {}}
                  >
                    <motion.div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        completed 
                          ? theme.completionChecked
                          : isHovered
                          ? `${theme.isDark ? 'border-2 border-blue-400 bg-blue-500/20' : 'border-2 border-blue-500 bg-blue-50'}`
                          : theme.completionUnchecked
                      } shadow-sm hover:shadow-md`}
                      initial={false}
                      animate={{
                        scale: completed ? 1.1 : 1,
                        rotate: completed ? 360 : 0,
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        rotate: { duration: 0.6 }
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {completed && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 600, damping: 25 }}
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
            <p className={`${theme.textSecondary} text-lg mb-8 max-w-md mx-auto`}>
              Start your journey towards better daily routines. Use the settings button in the top-right corner to add your first habit.
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