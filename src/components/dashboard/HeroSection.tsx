import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRing, Card } from '../ui';
import { useHabitStore } from '../../stores/habitStore';
import { habitService } from '../../services/habitService';

export const HeroSection: React.FC = () => {
  const { habits, preferences } = useHabitStore();
  const todayProgress = habitService.getTodayProgress(habits);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = preferences.name || 'there';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getMotivationalMessage = () => {
    if (todayProgress.percentage === 100) {
      return "Perfect day! You're crushing your goals! 🎉";
    }
    if (todayProgress.percentage >= 80) {
      return "You're doing amazing! Keep it up! ⭐";
    }
    if (todayProgress.percentage >= 50) {
      return "Great progress! You're halfway there! 💪";
    }
    if (todayProgress.percentage > 0) {
      return "Good start! Every step counts! 🌱";
    }
    return "Ready to build amazing habits today? ✨";
  };

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl font-display font-bold text-gradient mb-2">
          {getGreeting()}
        </h1>
        <p className="text-lg text-slate-600">
          {getMotivationalMessage()}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center"
      >
        <Card className="p-8">
          <div className="flex items-center space-x-6">
            <ProgressRing
              progress={todayProgress.percentage}
              size={100}
              strokeWidth={6}
              color="#4ECDC4"
            />
            <div className="text-left">
              <h3 className="text-xl font-semibold text-slate-800 mb-1">
                Today's Progress
              </h3>
              <p className="text-slate-600 mb-2">
                {todayProgress.completed} of {todayProgress.total} habits completed
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <span>🔥 Keep the momentum!</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};