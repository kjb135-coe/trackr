import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HabitV2 } from '../../types';
import { Card } from '../ui';
import { CelebrationEffect } from '../animations/CelebrationEffect';
import { cn } from '../../utils/cn';

interface HabitCardProps {
  habit: HabitV2;
  onComplete: (habitId: string) => void;
  index: number;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete, index }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = habit.completions[today]?.completed || false;
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    if (!isCompletedToday) {
      setShowCelebration(true);
    }
    onComplete(habit.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card 
        hover 
        className={cn(
          "p-6 transition-all duration-200",
          isCompletedToday 
            ? "bg-gradient-to-r from-success-50 to-success-100 border-success-200" 
            : "hover:border-primary-200"
        )}
        onClick={handleComplete}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "text-2xl p-2 rounded-full transition-colors",
                isCompletedToday 
                  ? "bg-success-200" 
                  : "bg-slate-100 hover:bg-primary-100"
              )}
            >
              {habit.emoji}
            </motion.div>
            <div>
              <h3 className="font-semibold text-slate-800">{habit.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                  {habit.category}
                </span>
                {habit.streak > 0 && (
                  <span className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
              isCompletedToday
                ? "bg-success-500 border-success-500"
                : "border-slate-300 hover:border-primary-400"
            )}
          >
            {isCompletedToday && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </motion.div>
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
          </div>
        )}

        <CelebrationEffect 
          trigger={showCelebration} 
          onComplete={() => setShowCelebration(false)}
          type="confetti"
        />
      </Card>
    </motion.div>
  );
};