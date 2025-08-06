import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Timer, Activity } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface TimeTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ isOpen, onClose }) => {
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
            <Clock className={`w-6 h-6 text-blue-500`} />
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Time Tracker</h2>
          </div>
          <p className={`${theme.textSecondary} text-sm`}>
            Track time spent on habits and analyze productivity patterns
          </p>
        </div>

        {/* Mock Time Stats */}
        <div className="space-y-4 mb-6">
          <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${theme.textSecondary}`}>Today's Focus Time</span>
              <Timer className={`w-4 h-4 ${theme.textSecondary}`} />
            </div>
            <div className={`text-3xl font-bold ${theme.textPrimary} mb-2`}>2h 45m</div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${theme.textSecondary}`}>Goal: 4h</span>
              <span className="text-xs text-blue-500">68% complete</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <Activity className={`w-5 h-5 text-orange-500 mx-auto mb-1`} />
              <div className={`text-lg font-semibold ${theme.textPrimary}`}>7</div>
              <div className={`text-xs ${theme.textSecondary}`}>Active Days</div>
            </div>
            <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <Clock className={`w-5 h-5 text-green-500 mx-auto mb-1`} />
              <div className={`text-lg font-semibold ${theme.textPrimary}`}>18h</div>
              <div className={`text-xs ${theme.textSecondary}`}>This Week</div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'} rounded-xl p-4 mb-6`}>
          <h3 className={`font-semibold ${theme.textPrimary} mb-2 text-sm`}>Planned Features:</h3>
          <ul className={`text-xs ${theme.textSecondary} space-y-1`}>
            <li>• Pomodoro timer integration</li>
            <li>• Time-based habit tracking</li>
            <li>• Productivity analytics</li>
            <li>• Focus session insights</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={onClose} variant="primary" className="w-full">
            Coming Soon
          </Button>
          <div className="text-center">
            <span className={`text-xs ${theme.textSecondary}`}>
              ⏱️ Feature Rating: 4/5 - Essential for productivity-focused users
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};