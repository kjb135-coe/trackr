import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import { HabitV2 } from '../../types';
import { habitService } from '../../services/habitService';
import { Card } from '../ui';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface InsightsPanelProps {
  habits: HabitV2[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ habits }) => {
  if (habits.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2">📊</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Insights Coming Soon
        </h3>
        <p className="text-slate-600">
          Complete some habits to see personalized insights
        </p>
      </Card>
    );
  }

  const weeklyProgress = habitService.getWeeklyProgress(habits);
  const todayProgress = habitService.getTodayProgress(habits);
  
  // Calculate completion trends
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const dailyCompletions = last7Days.map(date => ({
    date,
    completed: habits.reduce((sum, habit) => 
      sum + (habit.completions[date]?.completed ? 1 : 0), 0
    ),
    total: habits.length
  }));

  const averageDaily = dailyCompletions.reduce((sum, day) => 
    sum + (day.completed / Math.max(day.total, 1)), 0
  ) / dailyCompletions.length;

  // Best performing habit
  const bestHabit = habits.reduce((best, current) => {
    const bestRate = best.analytics.totalCompletions / Math.max(
      Math.floor((Date.now() - best.createdAt.getTime()) / (1000 * 60 * 60 * 24)), 1
    );
    const currentRate = current.analytics.totalCompletions / Math.max(
      Math.floor((Date.now() - current.createdAt.getTime()) / (1000 * 60 * 60 * 24)), 1
    );
    return currentRate > bestRate ? current : best;
  }, habits[0]);

  // Most consistent habit (least gaps)
  const mostConsistent = habits.reduce((most, current) => {
    return current.streak > most.streak ? current : most;
  }, habits[0]);

  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5 text-success-500" />,
      title: "Weekly Progress",
      value: `${Math.round(averageDaily * 100)}%`,
      description: `Average daily completion rate this week`,
      trend: averageDaily > 0.7 ? "excellent" : averageDaily > 0.5 ? "good" : "needs-improvement"
    },
    {
      icon: <Target className="w-5 h-5 text-primary-500" />,
      title: "Top Performer",
      value: bestHabit.name,
      description: `${bestHabit.analytics.totalCompletions} total completions`,
      trend: "good"
    },
    {
      icon: <Calendar className="w-5 h-5 text-accent-500" />,
      title: "Longest Streak",
      value: `${mostConsistent.streak} days`,
      description: mostConsistent.name,
      trend: mostConsistent.streak >= 7 ? "excellent" : mostConsistent.streak >= 3 ? "good" : "needs-improvement"
    },
    {
      icon: <Clock className="w-5 h-5 text-secondary-500" />,
      title: "Today's Focus",
      value: `${todayProgress.completed}/${todayProgress.total}`,
      description: "Habits completed today",
      trend: todayProgress.percentage >= 80 ? "excellent" : todayProgress.percentage >= 50 ? "good" : "needs-improvement"
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "excellent": return "text-success-600 bg-success-50 border-success-200";
      case "good": return "text-primary-600 bg-primary-50 border-primary-200";
      case "needs-improvement": return "text-accent-600 bg-accent-50 border-accent-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
        <span>📊</span>
        <span>Your Insights</span>
      </h3>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getTrendColor(insight.trend)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-white">
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-slate-800">{insight.title}</h4>
                  <span className="text-lg font-bold">{insight.value}</span>
                </div>
                <p className="text-sm text-slate-600">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini chart */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-700 mb-3">7-Day Trend</h4>
        <div className="flex items-end space-x-2 h-16">
          {dailyCompletions.map((day, index) => {
            const percentage = (day.completed / Math.max(day.total, 1)) * 100;
            const height = Math.max(8, (percentage / 100) * 48);
            
            return (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-primary-400 to-primary-600 rounded-t-sm"
                title={`${day.completed}/${day.total} (${Math.round(percentage)}%)`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{format(new Date(last7Days[0]), 'MMM d')}</span>
          <span>Today</span>
        </div>
      </div>
    </Card>
  );
};