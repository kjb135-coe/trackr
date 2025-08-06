import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Lock, TrendingUp } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ 
  isOpen, 
  onClose, 
  achievements 
}) => {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  const completionPercentage = Math.round((unlockedAchievements.length / achievements.length) * 100);

  const getProgressWidth = (achievement: Achievement) => {
    return Math.max(8, (achievement.progress / achievement.maxProgress) * 100);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
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
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-500 to-primary-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Your Achievements</h2>
                    <p className="text-white/80">
                      {unlockedAchievements.length} of {achievements.length} unlocked ({completionPercentage}%)
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-white h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent-500" />
                    Earned Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlockedAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 rounded-xl p-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Star className="w-4 h-4 text-accent-500 fill-current" />
                          </motion.div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="text-3xl p-2 bg-gradient-to-r from-accent-200 to-primary-200 rounded-full"
                          >
                            {achievement.icon}
                          </motion.div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{achievement.name}</h4>
                            <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                            <div className="text-xs text-accent-600 font-medium">
                              Unlocked {getTimeAgo(new Date(achievement.unlockedAt!))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-500" />
                    In Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (unlockedAchievements.length + index) * 0.1 }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl p-2 bg-slate-200 rounded-full opacity-60">
                            <Lock className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-600">{achievement.name}</h4>
                            <p className="text-sm text-slate-500 mb-3">{achievement.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Progress</span>
                                <span className="text-slate-600 font-medium">
                                  {achievement.progress} / {achievement.maxProgress}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="bg-gradient-to-r from-accent-400 to-primary-500 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getProgressWidth(achievement)}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                />
                              </div>
                              <div className="text-xs text-slate-500">
                                {Math.round((achievement.progress / achievement.maxProgress) * 100)}% complete
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {achievements.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No achievements yet</h3>
                  <p className="text-slate-500">Start completing habits to unlock your first achievement!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};