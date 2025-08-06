import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ChevronRight } from 'lucide-react';
import { Achievement } from '../../types';
import { Card } from '../ui';
import { AchievementModal } from './AchievementModal';

interface AchievementDisplayProps {
  achievements: Achievement[];
  showAll?: boolean;
}

export const AchievementDisplay: React.FC<AchievementDisplayProps> = ({ 
  achievements, 
  showAll = false 
}) => {
  const [showAllAchievements, setShowAllAchievements] = useState(showAll);
  const [showModal, setShowModal] = useState(false);
  
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  const recentlyUnlocked = unlockedAchievements
    .filter(a => a.unlockedAt && new Date(a.unlockedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    .slice(0, 3);

  const displayAchievements = showAllAchievements 
    ? [...unlockedAchievements, ...lockedAchievements]
    : recentlyUnlocked;

  if (!showAllAchievements && recentlyUnlocked.length === 0) {
    return (
      <>
        <Card 
          hover
          className="p-6 text-center cursor-pointer transition-all duration-200"
          onClick={() => setShowModal(true)}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-4xl mb-2"
          >
            🏆
          </motion.div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Ready for Achievements!
          </h3>
          <p className="text-slate-600 mb-4">
            Complete habits to unlock your first achievement
          </p>
          <div className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
            <span>View All Achievements</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </Card>

        <AchievementModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          achievements={achievements}
        />
      </>
    );
  }

  const getProgressWidth = (achievement: Achievement) => {
    return Math.max(8, (achievement.progress / achievement.maxProgress) * 100);
  };

  return (
    <>
      <Card 
        hover
        className="p-6 cursor-pointer transition-all duration-200"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-accent-500" />
            <span>
              {showAllAchievements ? 'All Achievements' : 'Recent Achievements'}
            </span>
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      {showAllAchievements && (
        <div className="mb-4 p-3 bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-800">
              {unlockedAchievements.length} / {achievements.length}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-accent-400 to-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(unlockedAchievements.length / achievements.length) * 100}%` 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {displayAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all ${
                achievement.unlockedAt
                  ? 'bg-gradient-to-r from-accent-50 to-primary-50 border-accent-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div
                    className={`text-2xl p-2 rounded-full ${
                      achievement.unlockedAt
                        ? 'bg-gradient-to-r from-accent-200 to-primary-200'
                        : 'bg-slate-200'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {achievement.unlockedAt ? achievement.icon : '🔒'}
                  </motion.div>
                  
                  {achievement.unlockedAt && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    >
                      <Star className="w-4 h-4 text-accent-500 fill-current" />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold ${
                      achievement.unlockedAt ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {achievement.name}
                    </h4>
                    
                    {achievement.unlockedAt && (
                      <span className="text-xs text-accent-600 font-medium">
                        Unlocked!
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-2 ${
                    achievement.unlockedAt ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {achievement.description}
                  </p>

                  {!achievement.unlockedAt && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-600 font-medium">
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <motion.div
                          className="bg-gradient-to-r from-accent-400 to-primary-500 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressWidth(achievement)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  {achievement.unlockedAt && (
                    <div className="text-xs text-slate-500">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      </Card>

      <AchievementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        achievements={achievements}
      />
    </>
  );
};