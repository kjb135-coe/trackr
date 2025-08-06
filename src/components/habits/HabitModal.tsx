import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { HABIT_TEMPLATES, habitService } from '../../services/habitService';
import { HabitTemplate } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: any) => void;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState<'template' | 'customize'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = HABIT_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTemplates = filteredTemplates.filter(t => t.isPopular);
  const otherTemplates = filteredTemplates.filter(t => !t.isPopular);

  const handleTemplateSelect = (template: HabitTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setStep('customize');
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    const newHabit = habitService.createHabit(selectedTemplate, customName);
    onSave(newHabit);
    handleClose();
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setCustomName('');
    setSearchQuery('');
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success-600 bg-success-100';
      case 'medium': return 'text-accent-600 bg-accent-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">
                  {step === 'template' ? 'Choose a Habit' : 'Customize Your Habit'}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {step === 'template' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <Input
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />

                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {popularTemplates.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                          Popular Habits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {popularTemplates.map((template) => (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleTemplateSelect(template)}
                              className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{template.emoji}</span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-800">{template.name}</h4>
                                  <p className="text-sm text-slate-500">{template.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">
                                      {template.category}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                                      {template.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {otherTemplates.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                          More Habits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {otherTemplates.map((template) => (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleTemplateSelect(template)}
                              className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{template.emoji}</span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-800">{template.name}</h4>
                                  <p className="text-sm text-slate-500">{template.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">
                                      {template.category}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                                      {template.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'customize' && selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                    <span className="text-3xl">{selectedTemplate.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800">{selectedTemplate.name}</h3>
                      <p className="text-sm text-slate-600">{selectedTemplate.description}</p>
                    </div>
                  </div>

                  <Input
                    label="Habit Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter a custom name for your habit"
                  />

                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setStep('template')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!customName.trim()}
                      className="flex-1"
                    >
                      Create Habit
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};