import Dexie, { type Table } from 'dexie';

// ─── Normalized record types (stored in IndexedDB) ───────────────────────────

export interface HabitRecord {
  id: string;
  name: string;
  emoji: string;
  category: string;
  streak: number;
  bestStreak: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // soft delete for future sync
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

export interface HabitCompletionRecord {
  id?: number; // auto-incremented
  habitId: string;
  date: string; // 'yyyy-MM-dd'
  completed: boolean;
  value?: number;
  completedAt?: Date;
  updatedAt: Date;
}

export interface SleepEntryRecord {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  factors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseEntryRecord {
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

export interface JournalEntryRecord {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionMealRecord {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionFoodItemRecord {
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

// ─── Database ────────────────────────────────────────────────────────────────

export class TrackrDatabase extends Dexie {
  habits!: Table<HabitRecord, string>;
  habitCompletions!: Table<HabitCompletionRecord, number>;
  sleepEntries!: Table<SleepEntryRecord, string>;
  exerciseEntries!: Table<ExerciseEntryRecord, string>;
  journalEntries!: Table<JournalEntryRecord, string>;
  nutritionMeals!: Table<NutritionMealRecord, string>;
  nutritionFoodItems!: Table<NutritionFoodItemRecord, string>;

  constructor() {
    super('trackr');

    this.version(1).stores({
      habits: 'id, category, createdAt, updatedAt',
      habitCompletions: '++id, habitId, date, [habitId+date]',
      sleepEntries: 'id, date',
      exerciseEntries: 'id, date',
      journalEntries: 'id, date',
      nutritionMeals: 'id, date, mealType',
      nutritionFoodItems: 'id, mealId',
    });
  }
}

export const db = new TrackrDatabase();
