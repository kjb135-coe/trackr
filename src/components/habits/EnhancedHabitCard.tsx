import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { MoreHorizontal, Edit2, Trash2, Undo2, Check } from 'lucide-react';
import { HabitV2 } from '../../types';
import { Card } from '../ui';
import { CelebrationEffect } from '../animations/CelebrationEffect';
import { cn } from '../../utils/cn';

interface EnhancedHabitCardProps {
  habit: HabitV2;
  onComplete: (habitId: string) => void;
  onEdit: (habit: HabitV2) => void;
  onDelete: (habitId: string) => void;
  index: number;
}

export const EnhancedHabitCard: React.FC<EnhancedHabitCardProps> = ({ 
  habit, 
  onComplete, 
  onEdit,
  onDelete,
  index 
}) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = habit.completions[today]?.completed || false;
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [undoTimeout, setUndoTimeout] = useState<number | null>(null);

  const handleComplete = () => {
    const wasCompleted = isCompletedToday;
    
    if (!wasCompleted) {
      setShowCelebration(true);
    }
    
    onComplete(habit.id);
    
    // Show undo notification for 5 seconds
    setShowUndoNotification(true);
    
    if (undoTimeout) {
      clearTimeout(undoTimeout);
    }
    
    const timeout = window.setTimeout(() => {
      setShowUndoNotification(false);
    }, 5000);
    
    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    onComplete(habit.id); // Toggle back
    setShowUndoNotification(false);
    if (undoTimeout) {
      clearTimeout(undoTimeout);
    }
  };

  const handleEdit = () => {
    onEdit(habit);
    setShowDropdown(false);
  };

  const handleDelete = () => {
    onDelete(habit.id);
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative"
    >
      <Card 
        hover 
        className={cn(
          "p-6 transition-all duration-300 relative overflow-hidden",
          isCompletedToday 
            ? "bg-gradient-to-r from-success-50 to-success-100 border-success-200 shadow-success-200/50" 
            : "hover:border-primary-200 hover:shadow-lg"
        )}
      >
        {/* Completion Overlay Animation */}
        <AnimatePresence>
          {isCompletedToday && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 bg-success-500 rounded-2xl"
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3 flex-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "text-2xl p-3 rounded-full transition-all duration-200 cursor-pointer",
                isCompletedToday 
                  ? "bg-success-200 shadow-inner" 
                  : "bg-slate-100 hover:bg-primary-100"
              )}
              onClick={handleComplete}
            >
              {habit.emoji}
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-lg">{habit.name}</h3>
                
                {/* Dropdown Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[120px] z-50"
                      >
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-1">
                <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                  {habit.category}
                </span>
                {habit.streak > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center space-x-1 text-orange-600"
                  >
                    <span className="text-sm">🔥</span>
                    <span className="text-sm font-semibold">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Completion Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 relative overflow-hidden",
              isCompletedToday
                ? "bg-success-500 border-success-500 shadow-lg"
                : "border-slate-300 hover:border-primary-400 hover:bg-primary-50"
            )}
          >
            <AnimatePresence mode="wait">
              {isCompletedToday ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-6 h-6 rounded-full border-2 border-slate-400"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {habit.settings.target && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">
                Goal: {habit.settings.target} {habit.settings.unit}
              </span>
              <span className="text-slate-500">
                {habit.completions[today]?.value || 0} / {habit.settings.target}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(((habit.completions[today]?.value || 0) / habit.settings.target!) * 100, 100)}%` 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Celebration Effect */}
        <CelebrationEffect 
          trigger={showCelebration} 
          onComplete={() => setShowCelebration(false)}
          type="confetti"
        />
      </Card>

      {/* Undo Notification */}
      <AnimatePresence>
        {showUndoNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <span className="text-sm">
              {isCompletedToday ? 'Marked as complete!' : 'Unmarked'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUndo}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-xs transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              Undo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};