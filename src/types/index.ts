export interface HabitV2 {
  id: string;
  name: string;
  emoji: string;
  category: string;
  streak: number;
  bestStreak: number;
  completions: Record<string, CompletionData>;
  createdAt: Date;
  settings: {
    target?: number;
    unit?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    reminders?: boolean;
  };
  analytics: {
    totalCompletions: number;
    averagePerWeek: number;
    bestWeek: Date | null;
  };
}

export interface CompletionData {
  completed: boolean;
  value?: number;
  completedAt?: Date;
}

export interface UserPreferencesV2 {
  theme: 'light' | 'dark' | 'auto';
  showOnboarding: boolean;
  name?: string;
  weeklyGoal?: number;
  celebrationLevel: 'minimal' | 'normal' | 'extra';
  insights: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface HabitTemplate {
  id: string;
  name: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  isPopular: boolean;
}

export interface WeeklyStats {
  currentWeek: {
    completed: number;
    total: number;
    percentage: number;
  };
  bestWeek: {
    completed: number;
    weekStart: Date;
  };
  streak: number;
}

export type OnboardingStep = 'welcome' | 'habits' | 'personalization' | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep;
  userName: string;
  selectedHabits: string[];
  isComplete: boolean;
}