import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Brain, Zap } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface HabitInsightsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HabitInsights: React.FC<HabitInsightsProps> = ({ isOpen, onClose }) => {
  const theme = useThemeClasses();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`${theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          border rounded-3xl shadow-2xl p-6 w-full max-w-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className={`w-6 h-6 text-purple-500`} />
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Advanced Insights</h2>
          </div>
          <p className={`${theme.textSecondary} text-sm`}>
            AI-powered insights and patterns from your habit data
          </p>
        </div>

        {/* Mock Insights */}
        <div className="space-y-4 mb-6">
          <div className={`${theme.isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'} border rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className={`text-sm font-medium ${theme.textPrimary}`}>Best Performance Day</span>
            </div>
            <p className={`text-xs ${theme.textSecondary}`}>
              You complete 85% more habits on Mondays. Try scheduling important habits early in the week!
            </p>
          </div>

          <div className={`${theme.isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-medium ${theme.textPrimary}`}>Streak Prediction</span>
            </div>
            <p className={`text-xs ${theme.textSecondary}`}>
              Based on current patterns, you're likely to reach a 30-day streak by next month.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'} rounded-xl p-4 mb-6`}>
          <h3 className={`font-semibold ${theme.textPrimary} mb-2 text-sm`}>Planned Features:</h3>
          <ul className={`text-xs ${theme.textSecondary} space-y-1`}>
            <li>• Pattern recognition in habit completion</li>
            <li>• Personalized recommendations</li>
            <li>• Optimal timing suggestions</li>
            <li>• Habit correlation analysis</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={onClose} variant="primary" className="w-full">
            Coming Soon
          </Button>
          <div className="text-center">
            <span className={`text-xs ${theme.textSecondary}`}>
              🧠 Feature Rating: 5/5 - Game-changing for habit optimization
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};