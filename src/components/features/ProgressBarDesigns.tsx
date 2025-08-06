import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Star, X } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface ProgressBarDesignsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressBarDesigns: React.FC<ProgressBarDesignsProps> = ({ isOpen, onClose }) => {
  const theme = useThemeClasses();
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);

  // Mock progress data
  const progressData = {
    completed: 18,
    total: 25,
    percentage: 72,
    streak: 7,
    weeklyGoal: 85
  };

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
          border rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Progress Bar Designs</h2>
            <p className={`${theme.textSecondary} text-sm`}>
              Choose your preferred progress visualization style
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105`}
          >
            <X className={`w-5 h-5 ${theme.textSecondary}`} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Design 1: Minimalist Linear */}
          <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-2xl p-6 ${selectedDesign === 1 ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>1. Minimalist Linear</h3>
              <button
                onClick={() => setSelectedDesign(selectedDesign === 1 ? null : 1)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDesign === 1 
                    ? 'bg-blue-500 text-white' 
                    : theme.isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedDesign === 1 ? 'Selected' : 'Select'}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.textSecondary}`}>Weekly Progress</span>
                <span className={`text-sm font-medium ${theme.textPrimary}`}>{progressData.completed}/{progressData.total}</span>
              </div>
              
              <div className={`w-full h-2 ${theme.isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressData.percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs ${theme.textSecondary}`}>{progressData.percentage}% complete</span>
                <span className={`text-xs ${theme.textSecondary}`}>Goal: {progressData.weeklyGoal}%</span>
              </div>
            </div>

            <div className={`mt-4 p-3 ${theme.isDark ? 'bg-gray-600/30' : 'bg-gray-100'} rounded-xl`}>
              <p className={`text-xs ${theme.textSecondary}`}>
                <strong>User's perspective:</strong> Clean and unobtrusive. Shows essential info without visual clutter. 
                Perfect for users who want progress tracking without distraction.
              </p>
            </div>
          </div>

          {/* Design 2: Gamified Circular */}
          <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-2xl p-6 ${selectedDesign === 2 ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>2. Gamified Circular</h3>
              <button
                onClick={() => setSelectedDesign(selectedDesign === 2 ? null : 2)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDesign === 2 
                    ? 'bg-blue-500 text-white' 
                    : theme.isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedDesign === 2 ? 'Selected' : 'Select'}
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke={theme.isDark ? '#374151' : '#e5e7eb'}
                    strokeWidth="8"
                    fill="none"
                    className="opacity-20"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 0, strokeDashoffset: 0 }}
                    animate={{ 
                      strokeDasharray: `${(progressData.percentage / 100) * 283} 283`,
                      strokeDashoffset: 0
                    }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${theme.textPrimary}`}>
                      {progressData.percentage}%
                    </div>
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Level 3
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${theme.textPrimary}`}>
                    {progressData.completed} of {progressData.total} habits completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className={`text-sm ${theme.textPrimary}`}>
                    {progressData.streak} day streak
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className={`text-sm ${theme.textPrimary}`}>
                    127 XP earned this week
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 ${theme.isDark ? 'bg-gray-600/30' : 'bg-gray-100'} rounded-xl`}>
              <p className={`text-xs ${theme.textSecondary}`}>
                <strong>User's perspective:</strong> Engaging and motivating with game-like elements. 
                The circular design feels more rewarding and provides multiple metrics at a glance. 
                Great for users who need extra motivation.
              </p>
            </div>
          </div>

          {/* Design 3: Detailed Analytics Bar */}
          <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-2xl p-6 ${selectedDesign === 3 ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>3. Detailed Analytics</h3>
              <button
                onClick={() => setSelectedDesign(selectedDesign === 3 ? null : 3)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDesign === 3 
                    ? 'bg-blue-500 text-white' 
                    : theme.isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedDesign === 3 ? 'Selected' : 'Select'}
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Multi-segment progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${theme.textPrimary}`}>This Week's Progress</span>
                  <span className={`text-sm ${theme.textSecondary}`}>{progressData.completed}/{progressData.total}</span>
                </div>
                
                <div className={`w-full h-4 ${theme.isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg overflow-hidden relative`}>
                  {/* Segments */}
                  {Array.from({ length: progressData.total }, (_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute top-0 h-full border-r border-gray-300/50 ${
                        i < progressData.completed ? 'bg-green-500' : ''
                      }`}
                      style={{
                        left: `${(i / progressData.total) * 100}%`,
                        width: `${100 / progressData.total}%`
                      }}
                      initial={{ backgroundColor: theme.isDark ? '#4b5563' : '#e5e7eb' }}
                      animate={{ 
                        backgroundColor: i < progressData.completed ? '#10b981' : (theme.isDark ? '#4b5563' : '#e5e7eb')
                      }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>
              </div>

              {/* Detailed breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-3 ${theme.isDark ? 'bg-gray-600/30' : 'bg-gray-100'} rounded-lg`}>
                  <div className={`text-lg font-bold text-green-500`}>
                    {progressData.completed}
                  </div>
                  <div className={`text-xs ${theme.textSecondary}`}>Completed</div>
                </div>
                <div className={`text-center p-3 ${theme.isDark ? 'bg-gray-600/30' : 'bg-gray-100'} rounded-lg`}>
                  <div className={`text-lg font-bold text-orange-500`}>
                    {progressData.total - progressData.completed}
                  </div>
                  <div className={`text-xs ${theme.textSecondary}`}>Remaining</div>
                </div>
                <div className={`text-center p-3 ${theme.isDark ? 'bg-gray-600/30' : 'bg-gray-100'} rounded-lg`}>
                  <div className={`text-lg font-bold ${theme.isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {progressData.streak}
                  </div>
                  <div className={`text-xs ${theme.textSecondary}`}>Day Streak</div>
                </div>
              </div>

              {/* Trend indicator */}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme.textSecondary}`}>
                  Up 12% from last week
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 ${theme.isDark ? 'bg-gray-600/30' : 'bg-gray-100'} rounded-xl`}>
              <p className={`text-xs ${theme.textSecondary}`}>
                <strong>User's perspective:</strong> Information-rich with granular detail. Perfect for data-driven users 
                who want to analyze patterns and trends. Shows individual habit completion and comparative metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className={`text-sm ${theme.textSecondary}`}>
              {selectedDesign ? `Design ${selectedDesign} selected` : 'Select a design to preview how it will look in the app'}
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Here you would save the selection
                  alert(`Design ${selectedDesign} will be implemented!`);
                  onClose();
                }} 
                variant="primary"
                disabled={!selectedDesign}
              >
                Apply Design
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};