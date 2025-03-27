export interface Habit {
  id: string;
  name: string;
  tag: string;
  streak: number;
  completions: {
    [date: string]: {
      completed: boolean;
      value?: number;
    };
  };
  goal?: {
    type: 'quantity';
    target: number;
    unit: string;
  };
  createdAt: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  showTutorial: boolean;
  name?: string;
  weeklyTrackGoal?: number;
}

export type Tag = {
  id: string;
  name: string;
  isCustom: boolean;
}

export const DEFAULT_TAGS: Tag[] = [
  { id: 'health', name: 'Health', isCustom: false },
  { id: 'productivity', name: 'Productivity', isCustom: false },
  { id: 'learning', name: 'Learning', isCustom: false },
  { id: 'fitness', name: 'Fitness', isCustom: false },
  { id: 'mindfulness', name: 'Mindfulness', isCustom: false },
]; 