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
  theme?: 'light' | 'dark';
  showOnboarding: boolean;
  name?: string;
  weeklyGoal?: number;
  celebrationLevel: 'minimal' | 'normal' | 'extra';
  insights: boolean;
  installDate?: Date;
  migrationVersion?: number;
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

// ─── Sleep ───────────────────────────────────────────────────────────────────

export interface SleepEntry {
  id: string;
  date: string; // 'yyyy-MM-dd'
  bedtime: string; // ISO datetime
  wakeTime: string; // ISO datetime
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  factors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const SLEEP_FACTORS = [
  'caffeine',
  'exercise',
  'stress',
  'screen_time',
  'alcohol',
  'late_meal',
  'nap',
  'medication',
] as const;

export type SleepFactor = typeof SLEEP_FACTORS[number];

// ─── Exercise ────────────────────────────────────────────────────────────────

export interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  notes?: string;
  heartRateAvg?: number;
  heartRateMax?: number;
  distance?: number;
  distanceUnit?: 'miles' | 'km';
  createdAt: Date;
  updatedAt: Date;
}

export const EXERCISE_TYPES = [
  'running',
  'cycling',
  'swimming',
  'weightlifting',
  'yoga',
  'walking',
  'hiking',
  'sports',
  'cardio',
  'stretching',
  'other',
] as const;

export type ExerciseType = typeof EXERCISE_TYPES[number];

// ─── Journal ─────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Nutrition ───────────────────────────────────────────────────────────────

export interface NutritionMeal {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  foodItems: NutritionFoodItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionFoodItem {
  id: string;
  mealId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  createdAt: Date;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export type OnboardingStep = 'welcome' | 'habits' | 'personalization' | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep;
  userName: string;
  selectedHabits: string[];
  isComplete: boolean;
}