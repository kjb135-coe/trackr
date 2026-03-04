import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Zap, Target, TrendingUp } from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { HABIT_TEMPLATES, habitService } from '../../services/habitService';
import { useHabitStore } from '../../stores/habitStore';
import { usePreferencesStore } from '../../stores/preferencesStore';

interface OnboardingFlowProps {
  isOpen: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen }) => {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const { addHabit, setError } = useHabitStore();
  const { updatePreferences } = usePreferencesStore();

  // Extract name from origin/hostname
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Try to extract a meaningful name from the hostname
      // This is a simple approach - in a real app you might want more sophisticated detection
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const parts = hostname.split('.');
        const potentialName = parts[0];
        if (potentialName && potentialName.length > 2) {
          setUserName(potentialName.charAt(0).toUpperCase() + potentialName.slice(1));
        }
      }
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Trackr 2.0! ✨",
      subtitle: "Your personal habit tracking companion",
      content: (
        <div className="text-center space-y-6">
          <motion.div 
            className="relative mx-auto w-24 h-24 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <div className="space-y-4">
            <p className="text-xl text-slate-700 dark:text-slate-200 font-medium">
              Build life-changing habits with a beautiful, minimalist calendar view
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <motion.div
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Daily Focus</p>
              </motion.div>
              <motion.div
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Track Progress</p>
              </motion.div>
              <motion.div
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Stay Motivated</p>
              </motion.div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What should we call you?",
      subtitle: "Let's make this personal",
      content: (
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="text-lg p-4 border-2 border-slate-200 focus:border-blue-500 transition-colors"
              autoFocus
            />
          </motion.div>
          {userName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-100 dark:border-blue-800"
            >
              <p className="text-lg text-slate-700 dark:text-slate-200">
                Perfect! Your dashboard will be called <strong>"{ userName}'s Trackr"</strong>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                You'll get personalized greetings and motivational messages
              </p>
            </motion.div>
          )}
        </div>
      )
    },
    {
      title: "Choose your starter habits",
      subtitle: "Select 3-5 habits to begin your journey",
      content: (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {HABIT_TEMPLATES.filter(t => t.isPopular).map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (selectedHabits.includes(template.id)) {
                    setSelectedHabits(prev => prev.filter(id => id !== template.id));
                  } else if (selectedHabits.length < 5) {
                    setSelectedHabits(prev => [...prev, template.id]);
                  }
                }}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedHabits.includes(template.id)
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg transform'
                    : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:shadow-md bg-white dark:bg-slate-700/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{template.emoji}</div>
                  <div className="font-semibold text-sm text-slate-700 dark:text-slate-200">{template.name}</div>
                  {selectedHabits.includes(template.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            className="text-center"
            animate={{ scale: selectedHabits.length >= 3 ? 1.05 : 1 }}
          >
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              selectedHabits.length >= 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              <span className="font-medium">Selected: {selectedHabits.length}/5 habits</span>
              {selectedHabits.length >= 3 && <Sparkles className="w-4 h-4" />}
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: `${userName ? `${userName}'s Trackr` : 'Your Trackr'} is ready! 🎉`,
      subtitle: "Time to build those life-changing habits",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative mx-auto w-20 h-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-spin-slow opacity-20"></div>
            <div className="absolute inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <p className="text-xl text-slate-700 dark:text-slate-200 font-medium">
              {userName ? `Welcome aboard, ${userName}!` : 'Welcome aboard!'} Your minimalist habit calendar is ready.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Every new tab will show your clean, calendar-style progress view.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <motion.div 
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Calendar View</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Clean grid layout</p>
            </motion.div>
            <motion.div 
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Quick Toggle</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Click to complete</p>
            </motion.div>
          </div>
        </div>
      )
    }
  ];

  const canContinue = () => {
    switch (step) {
      case 1: return userName.trim().length > 0;
      case 2: return selectedHabits.length >= 3;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // Save preferences
      await updatePreferences({
        name: userName,
        showOnboarding: false,
      });

      // Create selected habits
      const templates = HABIT_TEMPLATES.filter(t => selectedHabits.includes(t.id));
      for (const template of templates) {
        const habit = habitService.createHabit(template);
        await addHabit(habit);
      }
    } catch (error) {
      setError('Failed to complete setup. Please try again.');
    }
  };

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-green-400/20 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="p-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index <= step ? 'bg-blue-500 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {step + 1} of {steps.length}
                  </span>
                </div>
                
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {currentStep.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {currentStep.subtitle}
                  </p>
                </motion.div>
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-8"
              >
                {currentStep.content}
              </motion.div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                >
                  <span>{step === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
                  {step !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                  {step === steps.length - 1 && <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};