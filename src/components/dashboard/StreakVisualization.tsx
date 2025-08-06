import React from 'react';
import { motion } from 'framer-motion';
import { HabitV2 } from '../../types';

interface StreakVisualizationProps {
  habits: HabitV2[];
}

export const StreakVisualization: React.FC<StreakVisualizationProps> = ({ habits }) => {
  const topStreaks = habits
    .filter(h => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  if (topStreaks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-slate-600">Start your first streak!</p>
      </div>
    );
  }

  const getFlameIntensity = (streak: number) => {
    if (streak >= 30) return 'from-red-400 to-orange-600';
    if (streak >= 14) return 'from-orange-400 to-red-500';
    if (streak >= 7) return 'from-yellow-400 to-orange-500';
    return 'from-yellow-300 to-orange-400';
  };

  const getFlameSize = (streak: number, index: number) => {
    const baseSize = index === 0 ? 48 : index === 1 ? 40 : 32;
    const streakMultiplier = Math.min(streak / 30, 2);
    return baseSize + (baseSize * streakMultiplier * 0.3);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🔥 Active Streaks</h3>
      
      <div className="space-y-3">
        {topStreaks.map((habit, index) => {
          const flameSize = getFlameSize(habit.streak, index);
          
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`w-12 h-12 bg-gradient-to-t ${getFlameIntensity(habit.streak)} rounded-full flex items-center justify-center`}
                  style={{ 
                    width: flameSize, 
                    height: flameSize,
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  }}
                >
                  <span className="text-white font-bold text-sm">
                    {habit.streak}
                  </span>
                </motion.div>
                
                {/* Particle effects for high streaks */}
                {habit.streak >= 7 && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  >
                    <span className="text-yellow-400 text-xs">✨</span>
                  </motion.div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{habit.emoji}</span>
                  <span className="font-medium text-slate-800">{habit.name}</span>
                </div>
                <div className="text-sm text-slate-600">
                  {habit.streak} day{habit.streak !== 1 ? 's' : ''} strong
                  {habit.bestStreak > habit.streak && (
                    <span className="ml-2 text-xs text-slate-500">
                      (Best: {habit.bestStreak})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Progress</div>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(habit.streak, 10) }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-2 h-2 bg-gradient-to-t from-orange-400 to-red-500 rounded-full"
                    />
                  ))}
                  {habit.streak > 10 && (
                    <span className="text-xs text-orange-600 font-medium ml-1">
                      +{habit.streak - 10}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {habits.length > topStreaks.length && (
        <div className="text-center">
          <p className="text-sm text-slate-500">
            {habits.length - topStreaks.length} more habit{habits.length - topStreaks.length !== 1 ? 's' : ''} ready to streak!
          </p>
        </div>
      )}
    </div>
  );
};