# Trackr

Personal habit tracking app for Keegan. React SPA that runs as a Chrome Extension (new tab override) or standalone web app. Weekly grid view for daily tracking, monthly calendar for historical analysis. Includes sleep, exercise, journal, and nutrition tracking features.

## Commands

Only these scripts exist in `package.json`:

```bash
npm start            # Dev server (BROWSER=none, react-scripts start)
npm run build        # Production build + copies manifest.json to build/
npm run build:extension  # Just the manifest copy step
npm test             # Jest via react-scripts test (watch mode)
npm run eject        # CRA eject (unused)
```

**`npm run lint` and `npm run typecheck` do NOT exist.**

## Tech Stack

| Dependency | Version | Notes |
|---|---|---|
| react / react-dom | ^18.2.0 | |
| typescript | ^5.3.3 | strict mode, target es5 |
| react-scripts | 5.0.1 | **CRA, NOT Vite** |
| react-router-dom | ^7.13.0 | HashRouter for client-side routing |
| tailwindcss | ^3.4.1 | class-based dark mode, `@tailwindcss/forms` plugin |
| framer-motion | ^11.0.3 | All animations |
| zustand | ^4.4.7 | Multiple stores (habits, preferences, features) |
| dexie | ^4.3.0 | IndexedDB ORM for primary data storage |
| date-fns | ^3.3.1 | v3 API |
| lucide-react | ^0.312.0 | Icons |
| clsx + tailwind-merge | ^2.1.0 / ^2.2.1 | `cn()` utility |
| uuid | ^9.0.1 | Habit ID generation (devDep) |
| @types/chrome | ^0.0.258 | Chrome Extension API types |
| @testing-library/react | ^16.3.0 | + jest-dom ^6.6.4, user-event ^14.6.1 |
| fake-indexeddb | ^6.2.5 | IndexedDB mock for tests (devDep) |

## Architecture

### Entry Point & Routing

```
index.tsx → App.tsx → HashRouter → ThemeProvider → Routes
  └─ AppShell (layout wrapper)
       ├─ Navigation (fixed top nav bar)
       │    ├─ Tab links: Habits, Dashboard
       │    ├─ Add Habit button (shown on / route)
       │    └─ Settings dropdown (ThemeToggle, Monthly View, Weekly Goal)
       ├─ <Outlet /> (React Router page content)
       │    ├─ / → HabitsPage → HabitCalendarGrid
       │    ├─ /monthly → MonthlyCalendarPage
       │    ├─ /sleep → SleepPage (hidden from nav, accessible via URL)
       │    ├─ /exercise → ExercisePage (hidden from nav, accessible via URL)
       │    ├─ /journal → JournalPage
       │    ├─ /nutrition → NutritionPage (hidden from nav, accessible via URL)
       │    └─ /dashboard → DashboardPage
       ├─ SimpleHabitModal (add habit)
       ├─ OnboardingFlow (first-run only)
       ├─ Error toast (fixed bottom-right)
       └─ Footer (X/LinkedIn/email links, fixed bottom-right)
```

### Data Flow

```
Components → Zustand stores → Repositories → IndexedDB (Dexie) / chrome.storage.sync
```

All mutations go through the repository layer. Stores call repositories, then update their own state.

### Storage

**Hybrid approach:**
- **IndexedDB** (Dexie.js): Habits + completions, Sleep, Exercise, Journal, Nutrition — large data sets that benefit from indexed queries
- **chrome.storage.sync / localStorage**: Preferences, Achievements — small data that benefits from cross-device sync

Database name: `trackr` with 7 tables:

| Table | Primary Key | Indexes |
|---|---|---|
| habits | id | category, createdAt, updatedAt |
| habitCompletions | ++id (auto) | habitId, date, [habitId+date] |
| sleepEntries | id | date |
| exerciseEntries | id | date |
| journalEntries | id | date |
| nutritionMeals | id | date, mealType |
| nutritionFoodItems | id | mealId |

Habits are stored **normalized** in IndexedDB (HabitRecord + HabitCompletionRecord tables) and **denormalized** back to HabitV2 in memory by the habitRepository.

**Migration** (`src/db/migration.ts`): On first load, migrates data from old `chrome.storage.sync` / `localStorage` keys (`trackr_v2_habits`, `trackr_v2_preferences`) into IndexedDB. Sets `migrationVersion: 1` in preferences to skip on future loads.

### Chrome Extension

`public/manifest.json`: Manifest V3, overrides new tab with `index.html`, requests `storage` permission. **No background scripts, service workers, or content scripts.** The extension is purely the React app loaded as a new tab page.

## Project Structure

### Source Code

```
src/
├── index.tsx                                          Entry point
├── App.tsx                                            HashRouter + Routes
├── index.css                                          Tailwind layers + custom classes
├── setupTests.ts                                      Jest setup + mocks
├── types/index.ts                                     All TypeScript interfaces
├── contexts/ThemeContext.tsx                           Theme provider (dark default)
├── hooks/useThemeClasses.ts                           Themed Tailwind class strings
├── styles/tokens.ts                                   Design tokens
├── utils/
│   ├── cn.ts                                          clsx + twMerge
│   └── logger.ts                                      Logger utility
├── db/
│   ├── database.ts                                    Dexie schema + record types
│   └── migration.ts                                   Old storage → IndexedDB migration
├── repositories/
│   ├── habitRepository.ts                             Habits + completions (IndexedDB)
│   ├── preferencesRepository.ts                       Preferences (chrome.storage.sync)
│   ├── achievementRepository.ts                       Achievements (chrome.storage.sync)
│   ├── sleepRepository.ts                             Sleep entries (IndexedDB)
│   ├── exerciseRepository.ts                          Exercise entries (IndexedDB)
│   ├── journalRepository.ts                           Journal entries (IndexedDB)
│   └── nutritionRepository.ts                         Meals + food items (IndexedDB)
├── stores/
│   ├── habitStore.ts                                  Habit state + actions
│   ├── preferencesStore.ts                            Preferences + onboarding state
│   ├── createFeatureStore.ts                          Store factory for feature stores
│   ├── sleepStore.ts                                  Sleep tracking store
│   ├── exerciseStore.ts                               Exercise tracking store
│   ├── journalStore.ts                                Journal store
│   └── nutritionStore.ts                              Nutrition tracking store
├── services/
│   ├── habitService.ts                                Habit templates, analytics, streak calc
│   ├── achievementService.ts                          8 achievement definitions + checker
│   └── storage.ts                                     DEPRECATED — replaced by repositories
└── components/
    ├── layout/
    │   ├── AppShell.tsx                                Main layout: nav, outlet, modals, footer
    │   ├── Navigation.tsx                             Top nav bar with route tabs + settings
    │   └── ComingSoon.tsx                             Placeholder component
    ├── pages/
    │   ├── HabitsPage.tsx                             Habits view wrapper
    │   └── MonthlyCalendarPage.tsx                    Full-screen monthly calendar
    ├── calendar/
    │   ├── HabitCalendarGrid.tsx                      PRIMARY VIEW — weekly table grid
    │   └── SimpleHabitModal.tsx                       Add habit modal
    ├── dashboard/
    │   ├── DashboardPage.tsx                          Orchestrator with period state + tab refresh
    │   ├── DashboardHeader.tsx                        Greeting + period segmented control (7d|30d|90d)
    │   ├── AggregateStats.tsx                         4 stat cards: completion rate, streak, totals
    │   ├── CompletionHeatmap.tsx                      GitHub-style SVG heatmap (13 weeks)
    │   ├── TrendChart.tsx                             SVG bar chart + 7-day rolling average line
    │   ├── HabitBreakdown.tsx                         Per-habit mini cards with sparklines
    │   ├── Sparkline.tsx                              Reusable tiny SVG line chart
    │   ├── WeakestHabits.tsx                          Weakest habits insight callout
    │   └── useDashboardData.ts                        Data computation hook (all useMemo)
    ├── sleep/
    │   ├── SleepPage.tsx                              Sleep tracking page
    │   ├── SleepLogModal.tsx                          Log sleep entry
    │   ├── SleepWeekView.tsx                          Weekly sleep visualization
    │   └── SleepStats.tsx                             Sleep statistics
    ├── exercise/
    │   ├── ExercisePage.tsx                           Exercise tracking page
    │   ├── ExerciseLogModal.tsx                       Log exercise entry
    │   └── ExerciseStats.tsx                          Exercise statistics
    ├── journal/
    │   ├── JournalPage.tsx                            Journal entry page
    │   └── JournalEntryModal.tsx                      Create/edit journal entry
    ├── nutrition/
    │   ├── NutritionPage.tsx                          Nutrition tracking page
    │   ├── NutritionMealModal.tsx                     Log meal
    │   └── NutritionStats.tsx                         Nutrition statistics
    ├── modals/
    │   └── WeeklyGoalModal.tsx                        Goal setting modal (used by Navigation)
    ├── ui/
    │   ├── index.ts                                   Barrel export
    │   ├── Button.tsx                                 Generic button
    │   ├── Card.tsx                                   Card wrapper
    │   ├── Input.tsx                                  Form input
    │   ├── ProgressRing.tsx                           SVG progress ring
    │   ├── ThemeToggle.tsx                            Light/dark toggle
    │   ├── ControlPanel.tsx                           OLD gear icon panel (not used in new layout)
    │   └── WeeklyGoalModal.tsx                        OLD goal modal (not used)
    ├── onboarding/
    │   └── OnboardingFlow.tsx                         4-step wizard
    └── features/                                      DEAD — skeleton components, not imported
        ├── WeeklyProgress.tsx
        ├── HabitInsights.tsx
        └── SocialHub.tsx
```

### Dead code (not imported from any live path)

```
src/components/features/              WeeklyProgress, HabitInsights, SocialHub (skeleton mockups)
src/components/ui/ControlPanel.tsx    Old gear icon panel, replaced by Navigation settings
src/components/ui/WeeklyGoalModal.tsx Old goal modal, replaced by modals/WeeklyGoalModal
src/services/storage.ts              Old StorageService, replaced by repositories
```

### Test files

```
src/setupTests.ts                                                Jest setup
src/db/__tests__/migration.test.ts                              Migration tests
src/repositories/__tests__/habitRepository.test.ts              Habit repository tests
src/repositories/__tests__/sleepRepository.test.ts              Sleep repository tests
src/components/calendar/__tests__/HabitCalendarGrid.test.tsx    Grid tests
src/components/modals/__tests__/WeeklyGoalModal.test.tsx        Goal modal tests
src/components/ui/__tests__/ControlPanel.test.tsx               Control panel tests
src/components/dashboard/__tests__/DashboardPage.test.tsx       Dashboard tests
src/components/sleep/__tests__/SleepPage.test.tsx               Sleep page tests
src/components/exercise/__tests__/ExercisePage.test.tsx         Exercise page tests
src/components/journal/__tests__/JournalPage.test.tsx           Journal page tests
src/components/nutrition/__tests__/NutritionPage.test.tsx       Nutrition page tests
```

## Data Model

From `src/types/index.ts`:

```typescript
interface HabitV2 {
  id: string;
  name: string;
  emoji: string;
  category: string;
  streak: number;
  bestStreak: number;
  completions: Record<string, CompletionData>;  // key format: 'yyyy-MM-dd'
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

interface CompletionData {
  completed: boolean;
  value?: number;
  completedAt?: Date;
}

interface UserPreferencesV2 {
  theme?: 'light' | 'dark';
  showOnboarding: boolean;
  name?: string;
  weeklyGoal?: number;            // 50-100, optional
  celebrationLevel: 'minimal' | 'normal' | 'extra';
  insights: boolean;
  installDate?: Date;
  migrationVersion?: number;      // Tracks old→new DB migration
}

interface SleepEntry {
  id: string;
  date: string;                   // 'yyyy-MM-dd'
  bedtime: string;                // ISO datetime
  wakeTime: string;               // ISO datetime
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  factors: string[];              // 'caffeine' | 'exercise' | 'stress' | etc.
  createdAt: Date;
  updatedAt: Date;
}

interface ExerciseEntry {
  id: string;
  date: string;
  type: string;                   // 'running' | 'cycling' | 'swimming' | etc.
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

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NutritionMeal {
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

interface NutritionFoodItem {
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
```

## State Management

### habitStore (Zustand)

**State:** `habits: HabitV2[]`, `achievements: Achievement[]`, `isLoading: boolean`, `error: string | null`

**Actions:** `loadData()`, `addHabit()`, `updateHabit()`, `deleteHabit()`, `completeHabit()`, `checkAchievements()`, `setError()`, `clearError()`

`loadData()` runs `runMigration()` first (no-op if already done), then parallel fetch of habits + achievements from repositories.

### preferencesStore (Zustand)

**State:** `preferences: UserPreferencesV2`, `onboarding: OnboardingState`, `isLoaded: boolean`

**Actions:** `loadPreferences()`, `updatePreferences()`, `updateOnboarding()`

### Feature Stores (sleepStore, exerciseStore, journalStore, nutritionStore)

Built using `createFeatureStore` factory. Each has:

**State:** `entries: T[]`, `isLoading: boolean`, `error: string | null`

**Actions:** `loadEntries()`, `addEntry()`, `updateEntry()`, `deleteEntry()`, `clearError()`

## Service Layer

### habitService.ts

- `HABIT_TEMPLATES`: 10 built-in templates (Exercise, Read, Meditate, Drink Water, Sleep Early, Code, Journal, Walk, Stretch, Learn Something New)
- `createHabit(template, customName?)` — generates UUID, returns new HabitV2
- `completeHabit(habit, date, value?)` — **toggles** completion, recalculates analytics
- `updateAnalytics(habit)` — recalculates streak, bestStreak, totalCompletions, averagePerWeek, bestWeek
- `getWeeklyProgress(habits)` — counts completions across current week
- `getTodayProgress(habits)` — counts today's completions

### achievementService.ts

8 achievements: first_habit, week_warrior, consistency_king, perfectionist, century_club, habit_collector, comeback_kid, early_bird.

## Theming / Styling

- **ThemeContext**: Provides `{ theme, effectiveTheme, setTheme }`. Defaults to `'dark'`. Applies `.dark` class on `document.documentElement`.
- **useThemeClasses**: Returns pre-built Tailwind class strings for cards, buttons, inputs, text, calendar cells, etc.
- **tokens.ts**: Design token system — 8pt spacing scale, blue primary palette, light/dark surface colors.
- **index.css**: Three `@layer` blocks — base, components, utilities.

## Monthly Calendar Color Coding

In `MonthlyCalendarPage.tsx:getDayColor()`:

| Condition | Color |
|---|---|
| Future day or today | Gray |
| Before installDate | Gray |
| No habits exist | Gray |
| 0% completed (past) | Red |
| 100% completed | Dark green |
| >60% completed | Green |
| 1-60% completed | Yellow |

## Testing

**Framework**: Jest (via CRA) + React Testing Library + @testing-library/user-event + fake-indexeddb

**Setup** (`src/setupTests.ts`): Imports jest-dom, mocks matchMedia, ResizeObserver, IntersectionObserver.

**Run**: `npm test` (watch mode by default)

### Testing Requirements

When implementing **significant features or major UI changes**, create comprehensive unit tests:
- Test all critical paths and edge cases
- Continue until all tests pass
- Place test files in `__tests__/` directories with `.test.tsx` suffix
- Wrap components in `<ThemeProvider>` for rendering
- Mock Zustand stores when testing components that use them
- Use `fake-indexeddb` for repository/migration tests

Small bug fixes, styling tweaks, and minor adjustments do not need tests.

## Known Issues & Quirks

### 1. Sleep, Exercise, Nutrition tabs are hidden

These features are fully built and functional but hidden from the nav bar. Routes still work via direct URL (e.g., `/#/sleep`). Only Habits, Journal, and Dashboard tabs are shown.

### 2. Old ControlPanel and ui/WeeklyGoalModal are dead code

`ControlPanel.tsx` and `ui/WeeklyGoalModal.tsx` were replaced by `Navigation.tsx` and `modals/WeeklyGoalModal.tsx`. The old files are still present but not imported.

### 3. storage.ts is deprecated

`src/services/storage.ts` is the old StorageService. All data access now goes through the repository layer. The file is kept for reference but not imported from any live path.

### 4. Tailwind config custom colors are unused

`tailwind.config.js` defines `primary` (coral), `secondary` (teal), `success` (green), `accent` (amber) color palettes that are not used anywhere. The actual UI uses Tailwind's built-in color scales.

### 5. Chrome Extension setup is minimal

`manifest.json` exists with `chrome_url_overrides.newtab` and `storage` permission. No background scripts, service workers, popup pages, or other extension-specific code.

## Conventions

- **Week starts on Monday**: `startOfWeek(date, { weekStartsOn: 1 })` used consistently
- **Date key format**: Completions keyed by `format(date, 'yyyy-MM-dd')` from date-fns
- **Functional components only**: All components are `React.FC<Props>` with hooks
- **Repository singletons**: Each repository exports a singleton instance
- **Theme classes via hook**: Components use `useThemeClasses()` for all themed styles
- **Framer Motion everywhere**: All animations use Framer Motion
- **Staggered animations**: List items use `delay: index * 0.05` pattern
- **Spring physics**: Interactive elements use `type: "spring"` with `stiffness` and `damping`
- **New components**: Place in the appropriate subdirectory under `src/components/`
- **Test files**: Place in `__tests__/` directory adjacent to the component. Always wrap in `<ThemeProvider>`.
