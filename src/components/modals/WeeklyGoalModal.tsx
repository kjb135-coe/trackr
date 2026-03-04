import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface WeeklyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal?: number;
  onSave: (goal: number | undefined) => void;
}

export const WeeklyGoalModal: React.FC<WeeklyGoalModalProps> = ({
  isOpen,
  onClose,
  currentGoal = 85,
  onSave
}) => {
  const theme = useThemeClasses();
  const focusTrapRef = useFocusTrap(isOpen);
  const [goal, setGoal] = useState(currentGoal);

  const handleSave = () => {
    onSave(goal);
    onClose();
  };

  const handleRemoveGoal = () => {
    onSave(undefined);
    onClose();
  };

  const handleCancel = () => {
    setGoal(currentGoal);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={focusTrapRef}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="weekly-goal-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md ${theme.card} p-6 z-50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${theme.isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-lg`}>
                  <Target className={`w-5 h-5 ${theme.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 id="weekly-goal-modal-title" className={`text-xl font-semibold ${theme.textPrimary}`}>
                  Set Weekly Goal
                </h2>
              </div>
              <button
                onClick={handleCancel}
                aria-label="Close dialog"
                className={`p-2 ${theme.hoverBg} rounded-lg transition-colors`}
              >
                <X className={`w-5 h-5 ${theme.textMuted}`} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Goal Display */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${theme.textPrimary} mb-2`}>
                  {goal}%
                </div>
                <div className={`text-sm ${theme.textSecondary}`}>
                  Complete at least {goal}% of your habits each week
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>50%</span>
                  <span className={theme.textSecondary}>100%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={goal}
                  onChange={(e) => setGoal(parseInt(e.target.value, 10))}
                  className={`w-full h-3 rounded-lg appearance-none cursor-pointer
                    ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'}
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-6
                    [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-blue-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-moz-range-thumb]:w-6
                    [&::-moz-range-thumb]:h-6
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-blue-500
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:border-none
                    [&::-moz-range-thumb]:shadow-lg`}
                />

                {/* Quick preset buttons */}
                <div className="flex gap-2 justify-center">
                  {[60, 70, 80, 85, 90].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setGoal(preset)}
                      aria-pressed={goal === preset}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        goal === preset
                          ? 'bg-blue-500 text-white'
                          : `${theme.isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className={`text-sm ${theme.textSecondary} p-4 ${theme.isDark ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg`}>
                <p>
                  Setting a weekly goal helps you stay motivated and track your progress.
                  A progress bar will appear when you set your goal.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCancel}
                className={`flex-1 ${theme.btnSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 ${theme.btnPrimary}`}
              >
                Save Goal
              </button>
            </div>

            {/* Remove Goal */}
            {currentGoal && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleRemoveGoal}
                  className={`text-sm ${
                    theme.isDark
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-red-500 hover:text-red-600'
                  } transition-colors`}
                >
                  Remove Goal
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
