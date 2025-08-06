import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, TrendingUp, Star, UserPlus, Medal, Crown, X } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { Button } from '../ui/Button';

interface SocialHubProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for demonstration
const mockFriends = [
  { id: '1', name: 'Alex Chen', avatar: '👨‍💻', score: 2847, streak: 15, completedToday: 8, totalToday: 10, status: 'online' },
  { id: '2', name: 'Sarah Kim', avatar: '👩‍🎨', score: 3156, streak: 23, completedToday: 7, totalToday: 8, status: 'online' },
  { id: '3', name: 'Mike Johnson', avatar: '🧑‍🏫', score: 2634, streak: 12, completedToday: 6, totalToday: 12, status: 'offline' },
  { id: '4', name: 'Emma Davis', avatar: '👩‍🔬', score: 2975, streak: 18, completedToday: 9, totalToday: 9, status: 'online' },
];

const mockUserScore = 2892; // User's current score
const userRank = 3; // User's position in leaderboard

export const SocialHub: React.FC<SocialHubProps> = ({ isOpen, onClose }) => {
  const theme = useThemeClasses();
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard' | 'challenges'>('friends');

  // Sort friends by score for leaderboard
  const leaderboardData = [...mockFriends, 
    { id: 'user', name: 'You (Keegan)', avatar: '🤓', score: mockUserScore, streak: 11, completedToday: 7, totalToday: 10, status: 'online' }
  ].sort((a, b) => b.score - a.score);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`${theme.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
            border rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className={`w-6 h-6 ${theme.textPrimary}`} />
              <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Social Hub</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${theme.hoverBg} rounded-lg transition-colors hover:scale-105`}
            >
              <X className={`w-5 h-5 ${theme.textSecondary}`} />
            </button>
          </div>

          {/* User Stats Summary */}
          <div className={`${theme.isDark ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'} rounded-2xl p-4 mb-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">🤓</div>
                <div>
                  <div className={`text-lg font-bold ${theme.textPrimary}`}>Your Score: {mockUserScore.toLocaleString()}</div>
                  <div className={`text-sm ${theme.textSecondary}`}>Rank #{userRank} globally • 11 day streak</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold text-green-500`}>7/10</div>
                <div className={`text-xs ${theme.textSecondary}`}>Today's Progress</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'friends' as const, label: 'Friends', icon: Users },
              { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
              { id: 'challenges' as const, label: 'Challenges', icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? theme.isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : theme.isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'friends' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${theme.textPrimary}`}>Your Friends ({mockFriends.length})</h3>
                  <Button variant="primary" size="sm" className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </Button>
                </div>

                {mockFriends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-4 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-2xl">{friend.avatar}</span>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${theme.isDark ? 'border-gray-700' : 'border-white'} ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <div className={`font-semibold ${theme.textPrimary}`}>{friend.name}</div>
                        <div className={`text-sm ${theme.textSecondary}`}>
                          {friend.streak} day streak • Score: {friend.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        friend.completedToday === friend.totalToday ? 'text-green-500' : 'text-orange-500'
                      }`}>
                        {friend.completedToday}/{friend.totalToday}
                      </div>
                      <div className={`text-xs ${theme.textSecondary}`}>Today</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4`}>Weekly Leaderboard</h3>

                {leaderboardData.map((person, index) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${person.id === 'user' ? 
                      (theme.isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200') + ' border' :
                      (theme.isDark ? 'bg-gray-700/50' : 'bg-gray-50')
                    } rounded-xl p-4 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        <span className={`text-lg font-bold ${theme.textPrimary} min-w-[24px]`}>#{index + 1}</span>
                      </div>
                      <span className="text-2xl">{person.avatar}</span>
                      <div>
                        <div className={`font-semibold ${theme.textPrimary} ${person.id === 'user' ? 'text-blue-500' : ''}`}>
                          {person.name}
                        </div>
                        <div className={`text-sm ${theme.textSecondary}`}>
                          {person.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${person.id === 'user' ? 'text-blue-500' : theme.textPrimary}`}>
                        {person.score.toLocaleString()}
                      </div>
                      <div className={`text-xs ${theme.textSecondary}`}>points</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'challenges' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className={`text-lg font-semibold ${theme.textPrimary} mb-4`}>Weekly Challenges</h3>

                <div className={`${theme.isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border rounded-xl p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="w-5 h-5 text-purple-500" />
                    <span className={`font-semibold ${theme.textPrimary}`}>Perfect Week Challenge</span>
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                  </div>
                  <p className={`text-sm ${theme.textSecondary} mb-3`}>
                    Complete all your habits for 7 consecutive days
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-full h-2 ${theme.isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full w-32`}>
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: '57%' }}></div>
                      </div>
                      <span className={`text-sm ${theme.textSecondary}`}>4/7 days</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-500">+500 XP</span>
                  </div>
                </div>

                <div className={`${theme.isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-xl p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-5 h-5 text-green-500" />
                    <span className={`font-semibold ${theme.textPrimary}`}>Social Butterfly</span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                  </div>
                  <p className={`text-sm ${theme.textSecondary} mb-3`}>
                    Beat 3 friends' daily completion rates this week
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-full h-2 ${theme.isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full w-32`}>
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '33%' }}></div>
                      </div>
                      <span className={`text-sm ${theme.textSecondary}`}>1/3 friends</span>
                    </div>
                    <span className="text-sm font-semibold text-green-500">+300 XP</span>
                  </div>
                </div>

                <div className={`${theme.isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'} border rounded-xl p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className={`font-semibold ${theme.textPrimary}`}>Consistency King</span>
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <p className={`text-sm ${theme.textSecondary} mb-3`}>
                    Maintain a 14-day streak in any habit
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.textSecondary}`}>Starts next Monday</span>
                    <span className="text-sm font-semibold text-orange-500">+750 XP</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Features List */}
          <div className={`mt-6 pt-6 border-t border-gray-200 dark:border-gray-700`}>
            <div className={`${theme.isDark ? 'bg-gray-700/30' : 'bg-gray-50/50'} rounded-xl p-4`}>
              <h3 className={`font-semibold ${theme.textPrimary} mb-2 text-sm`}>Coming Soon:</h3>
              <ul className={`text-xs ${theme.textSecondary} space-y-1`}>
                <li>• Private groups and habit sharing</li>
                <li>• Voice encouragement messages</li>
                <li>• Team challenges with collective goals</li>
                <li>• Habit buddy matching system</li>
                <li>• Achievement showcases and badges</li>
              </ul>
            </div>
            <div className="text-center mt-4">
              <span className={`text-xs ${theme.textSecondary}`}>
                🏆 Feature Rating: 5/5 - Transform habits into a social, competitive experience
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};