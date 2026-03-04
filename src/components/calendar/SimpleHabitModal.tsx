import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { HABIT_TEMPLATES, habitService } from '../../services/habitService';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { HabitV2 } from '../../types';

interface SimpleHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: HabitV2) => void;
}

export const SimpleHabitModal: React.FC<SimpleHabitModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const theme = useThemeClasses();
  const [habitName, setHabitName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habitName.trim()) return;
    
    const template = HABIT_TEMPLATES.find(t => t.id === selectedTemplate) || HABIT_TEMPLATES[0];
    const newHabit = habitService.createHabit(template, habitName.trim());
    
    onSave(newHabit);
    handleClose();
  };

  const handleClose = () => {
    setHabitName('');
    setSelectedTemplate(null);
    onClose();
  };

  const popularHabits = HABIT_TEMPLATES.filter(t => t.isPopular).slice(0, 6);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${theme.isDark ? 'bg-black/60' : 'bg-black/40'} backdrop-blur-sm`}
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative ${theme.card} w-full max-w-lg shadow-2xl`}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>
                  Add New Habit
                </h2>
                <button
                  onClick={handleClose}
                  className={`p-2 ${theme.hoverBg} rounded-xl transition-all duration-200 hover:scale-105`}
                >
                  <X className={`w-5 h-5 ${theme.textMuted}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className={`block text-sm font-semibold ${theme.textPrimary} mb-3`}>
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="e.g. Morning workout, Read 30 minutes..."
                    className={`${theme.input} w-full text-lg py-3 px-4`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${theme.textPrimary} mb-4`}>
                    Quick Start Templates (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {popularHabits.map((template) => (
                      <motion.button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setHabitName(template.name);
                          setSelectedTemplate(template.id);
                        }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          selectedTemplate === template.id
                            ? theme.isDark 
                              ? 'border-blue-400 bg-blue-500/20' 
                              : 'border-blue-500 bg-blue-50'
                            : theme.isDark
                              ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-2xl mb-2">{template.emoji}</div>
                        <div className={`text-xs font-medium ${theme.textSecondary}`}>
                          {template.name}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={`${theme.btnSecondary} flex-1 py-3 text-base font-medium`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!habitName.trim()}
                    className={`${theme.btnPrimary} flex-1 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};