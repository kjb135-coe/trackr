import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, PieChart, TrendingDown } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface BudgetTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ isOpen, onClose }) => {
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
            <DollarSign className={`w-6 h-6 text-green-500`} />
            <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Budget Tracker</h2>
          </div>
          <p className={`${theme.textSecondary} text-sm`}>
            Track spending habits and financial goals alongside your daily habits
          </p>
        </div>

        {/* Mock Budget Overview */}
        <div className="space-y-4 mb-6">
          <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textSecondary}`}>Monthly Budget</span>
              <PieChart className={`w-4 h-4 ${theme.textSecondary}`} />
            </div>
            <div className={`text-2xl font-bold ${theme.textPrimary}`}>$2,500</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-xs text-green-500">65% used</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <TrendingDown className={`w-5 h-5 text-red-500 mx-auto mb-1`} />
              <div className={`text-lg font-semibold ${theme.textPrimary}`}>$875</div>
              <div className={`text-xs ${theme.textSecondary}`}>This Week</div>
            </div>
            <div className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <DollarSign className={`w-5 h-5 text-green-500 mx-auto mb-1`} />
              <div className={`text-lg font-semibold ${theme.textPrimary}`}>$425</div>
              <div className={`text-xs ${theme.textSecondary}`}>Saved</div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'} rounded-xl p-4 mb-6`}>
          <h3 className={`font-semibold ${theme.textPrimary} mb-2 text-sm`}>Planned Features:</h3>
          <ul className={`text-xs ${theme.textSecondary} space-y-1`}>
            <li>• Expense categorization and tracking</li>
            <li>• Budget goals and alerts</li>
            <li>• Integration with banking APIs</li>
            <li>• Spending habit analysis</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={onClose} variant="primary" className="w-full">
            Coming Soon
          </Button>
          <div className="text-center">
            <span className={`text-xs ${theme.textSecondary}`}>
              💰 Feature Rating: 3/5 - Nice to have for comprehensive life tracking
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};