import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar, X } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface WeeklyProgressProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ isOpen, onClose }) => {
  const theme = useThemeClasses();
  const [selectedMetric, setSelectedMetric] = useState<'completion' | 'streak' | 'consistency'>('completion');

  // Mock data for different metrics
  const metrics = {
    completion: { current: 68, goal: 85, label: 'Completion Rate', unit: '%' },
    streak: { current: 7, goal: 14, label: 'Current Streak', unit: ' days' },
    consistency: { current: 5, goal: 7, label: 'Days Active', unit: ' days' }
  };

  const activeMetric = metrics[selectedMetric];
  const progressPercentage = (activeMetric.current / activeMetric.goal) * 100;

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
          border rounded-2xl shadow-2xl p-4 w-full max-w-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className={`w-5 h-5 ${theme.textPrimary}`} />
            <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Weekly Progress</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105`}
          >
            <X className={`w-4 h-4 ${theme.textSecondary}`} />
          </button>
        </div>
        <div className="text-center mb-4">
          <p className={`${theme.textSecondary} text-xs`}>
            Track your weekly progress across different metrics
          </p>
        </div>

        {/* Metric Selection */}
        <div className="flex space-x-1 mb-4">
          {Object.entries(metrics).map(([key, metric]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as any)}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedMetric === key
                  ? theme.isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme.isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke={theme.isDark ? '#374151' : '#e5e7eb'}
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke={theme.isDark ? '#60a5fa' : '#3b82f6'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(progressPercentage / 100) * 327} 327`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                  {activeMetric.current}
                </div>
                <div className={`text-xs ${theme.textSecondary}`}>
                  of {activeMetric.goal}{activeMetric.unit}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
            <TrendingUp className={`w-4 h-4 ${theme.textSecondary} mx-auto mb-1`} />
            <div className={`text-base font-semibold ${theme.textPrimary}`}>
              {Math.round(progressPercentage)}%
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>Complete</div>
          </div>
          <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
            <Calendar className={`w-4 h-4 ${theme.textSecondary} mx-auto mb-1`} />
            <div className={`text-base font-semibold ${theme.textPrimary}`}>
              {7 - new Date().getDay()}
            </div>
            <div className={`text-xs ${theme.textSecondary}`}>Days Left</div>
          </div>
        </div>

        {/* Goal Setting */}
        <div className="mb-4">
          <label className={`block text-sm font-medium ${theme.textSecondary} mb-2`}>
            {activeMetric.label} Goal
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={selectedMetric === 'completion' ? 50 : selectedMetric === 'streak' ? 7 : 1}
              max={selectedMetric === 'completion' ? 100 : selectedMetric === 'streak' ? 30 : 7}
              value={activeMetric.goal}
              onChange={(e) => {
                // Update the goal in the metrics object (in a real app, this would save to storage)
                console.log('Goal updated to:', e.target.value);
              }}
              className="flex-1"
            />
            <span className={`${theme.textPrimary} font-semibold w-12 text-right`}>
              {activeMetric.goal}{activeMetric.unit}
            </span>
          </div>
        </div>

        {/* Progress History */}
        <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'} rounded-xl p-3 mb-4`}>
          <h3 className={`font-semibold ${theme.textPrimary} mb-2 text-sm`}>This Week's Progress</h3>
          <div className="flex items-center justify-between mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
              const completed = index < 5; // Mock data showing progress through Friday
              const isToday = index === 4; // Mock Thursday as today
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                    completed 
                      ? 'bg-green-500 text-white' 
                      : isToday 
                        ? theme.isDark ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500' : 'bg-blue-50 text-blue-600 border-2 border-blue-500'
                        : theme.isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {completed ? '✓' : day}
                  </div>
                  <span className={`text-xs ${theme.textSecondary}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={onClose} variant="primary" className="w-full">
            Save Goal
          </Button>
          <div className="text-center">
            <span className={`text-xs ${theme.textSecondary}`}>
              ⭐ Feature Rating: 4/5 - Essential for motivation and progress tracking
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};