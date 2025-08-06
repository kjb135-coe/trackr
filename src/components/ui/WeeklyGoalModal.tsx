import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface WeeklyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
  onSave: (goal: number) => void;
}

export const WeeklyGoalModal: React.FC<WeeklyGoalModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSave
}) => {
  const theme = useThemeClasses();
  const [goal, setGoal] = useState(currentGoal);

  const presetGoals = [50, 60, 70, 80, 85, 90, 95, 100];

  const handleSave = () => {
    onSave(goal);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${theme.card} w-full max-w-md p-6 shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${theme.textPrimary}`} />
                  <h2 className={`text-xl font-semibold ${theme.textPrimary}`}>
                    Weekly Goal
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 ${theme.hoverBg} rounded-lg transition-colors`}
                >
                  <X className={`w-4 h-4 ${theme.textMuted}`} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className={`${theme.textSecondary} text-sm`}>
                  Set your target completion percentage for the week. This helps track your progress and stay motivated.
                </p>

                {/* Preset Buttons */}
                <div>
                  <label className={`text-sm font-medium ${theme.textPrimary} block mb-3`}>
                    Quick Select
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetGoals.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setGoal(preset)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          goal === preset
                            ? 'bg-blue-500 text-white'
                            : `${theme.isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider */}
                <div>
                  <label className={`text-sm font-medium ${theme.textPrimary} block mb-3`}>
                    Custom Goal: {goal}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className={`flex-1 px-4 py-2 text-sm ${theme.isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Save Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};