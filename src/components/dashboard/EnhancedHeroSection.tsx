import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from '../ui';
import { useHabitStore } from '../../stores/habitStore';
import { habitService } from '../../services/habitService';


export const EnhancedHeroSection: React.FC = () => {
  const { habits, preferences } = useHabitStore();
  const todayProgress = habitService.getTodayProgress(habits);
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = preferences.name || 'there';
    
    if (hour < 6) return { text: `Still up, ${name}?`, emoji: '🌙' };
    if (hour < 12) return { text: `Good morning, ${name}!`, emoji: '🌅' };
    if (hour < 17) return { text: `Good afternoon, ${name}!`, emoji: '☀️' };
    if (hour < 22) return { text: `Good evening, ${name}!`, emoji: '🌆' };
    return { text: `Burning the midnight oil, ${name}?`, emoji: '🌃' };
  };

  const getTimeBasedGradient = () => {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'from-indigo-900 via-purple-800 to-slate-900'; // Night
    if (hour < 12) return 'from-amber-200 via-orange-200 to-yellow-100'; // Morning
    if (hour < 17) return 'from-blue-300 via-sky-200 to-cyan-100'; // Afternoon
    if (hour < 22) return 'from-orange-300 via-pink-200 to-purple-200'; // Evening
    return 'from-slate-800 via-purple-900 to-indigo-900'; // Late night
  };


  const greeting = getTimeBasedGreeting();

  return (
    <div className={`bg-gradient-to-br ${getTimeBasedGradient()} rounded-3xl p-8 mb-8 shadow-xl overflow-hidden relative`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      <div className="relative z-10">
        {/* Top Row: Greeting + Progress */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-800 mb-2 flex items-center gap-3">
              <span>{greeting.emoji}</span>
              <span>{greeting.text}</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-6"
          >
            <div className="text-right">
              <h3 className="text-xl font-semibold text-slate-700 mb-1">
                Today's Progress
              </h3>
              <p className="text-slate-600">
                {todayProgress.completed} of {todayProgress.total} habits completed
              </p>
              <div className="flex items-center justify-end gap-2 mt-2 text-sm text-slate-500">
                <span>🔥</span>
                <span>Keep it up!</span>
              </div>
            </div>
            
            <ProgressRing
              progress={todayProgress.percentage}
              size={120}
              strokeWidth={8}
              color="#4ECDC4"
              backgroundColor="rgba(255,255,255,0.3)"
            />
          </motion.div>
        </div>

      </div>
    </div>
  );
};