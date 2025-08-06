# Trackr - Habit Tracking Application

## High-Level Overview

Trackr is a modern, elegant habit tracking React application built for personal use by Keegan. The app helps users track daily habits with a beautiful, intuitive interface that emphasizes visual feedback and user experience. The application features both weekly grid view for daily tracking and a comprehensive monthly calendar view for historical analysis.

## Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme support
- **Animations**: Framer Motion for smooth transitions and interactions
- **State Management**: Zustand for global state
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Data Persistence**: Local Storage with structured service layer
- **Build Tool**: Vite
- **Package Manager**: npm

## Current State & Architecture

### Core Components

1. **App.tsx** - Main application wrapper with view routing between weekly and monthly views
2. **HabitCalendarGrid.tsx** - Primary weekly habit tracking interface with enhanced progress bar
3. **MonthlyCalendarPage.tsx** - Full-screen monthly calendar view with tooltips and color coding
4. **ControlPanel.tsx** - Settings and navigation controls
5. **Theme System** - Dark/light theme support with useThemeClasses hook

### Key Features Implemented

- **Weekly Habit Tracking**: Grid-based interface showing 7 days with completion status
- **Monthly Calendar View**: Full-screen historical view with color-coded completion rates
- **Enhanced Progress Bar**: Gradient-filled progress tracking with animations and pulsing effects
- **Smart Tooltips**: Context-aware positioning that prevents screen cutoffs
- **Theme Support**: Dark mode as default with light mode toggle
- **Installation Date Logic**: Only applies color coding from app installation date forward
- **Responsive Design**: Works across different screen sizes
- **Skeleton Features**: WeeklyProgress, BudgetTracker, HabitInsights, TimeTracker, DataExport, SocialHub

### Data Structure

```typescript
interface HabitV2 {
  id: string;
  name: string;
  emoji: string;
  category: string;
  streak: number;
  bestStreak: number;
  completions: Record<string, CompletionData>;
  createdAt: Date;
  settings: { target?: number; unit?: string; difficulty: 'easy' | 'medium' | 'hard'; reminders?: boolean; };
  analytics: { totalCompletions: number; averagePerWeek: number; bestWeek: Date | null; };
}

interface UserPreferencesV2 {
  theme?: 'light' | 'dark';
  showOnboarding: boolean;
  name?: string;
  weeklyGoal?: number;
  celebrationLevel: 'minimal' | 'normal' | 'extra';
  insights: boolean;
  installDate?: Date;
}
```

## Recurring Issues & Solutions

### 1. JSX Parsing Errors with Special Characters
**Issue**: `Unexpected token. Did you mean '{'>'}' or '&gt;'?` when using `>` in JSX
**Solution**: Always escape special characters in JSX as `{'>'}` instead of raw `>`
**Files Affected**: MonthlyCalendarView.tsx:260

### 2. Tooltip Positioning and Cutoffs
**Issue**: Tooltips getting cut off at screen edges, especially in monthly calendar
**Initial Attempts**: 
  - Mouse coordinate-based positioning (caused glitches)
  - Fixed positioning with viewport checks
**Final Solution**: 
  - Smart positioning based on date position (`date.getDate() > 15` determines left vs right)
  - Enhanced backdrop blur and translucency (`bg-gray-900/95` instead of `bg-gray-900`)
  - Converted monthly view from popup to full-screen page to eliminate constraints
**Files Affected**: MonthlyCalendarPage.tsx

### 3. Current Day Color Logic
**Issue**: Current day was showing red color when user hadn't completed habits yet
**Solution**: Modified color logic to always show current day as gray/transparent regardless of completion
**Code**: `if (isFuture || isToday) { return theme.isDark ? 'bg-gray-700/50' : 'bg-gray-200/50'; }`
**Files Affected**: MonthlyCalendarPage.tsx

### 4. Build Compilation Errors
**Issue**: Unused imports and variables causing ESLint warnings
**Solution**: Systematic cleanup of unused imports: Sparkles, useRef, isSameMonth, Button, AnimatePresence, and unused local variables
**Prevention**: Regular linting with `npm run lint` and `npm run typecheck`

### 5. Installation Date Color Rules
**Issue**: Historical dates before app installation showing red (missed days) 
**Solution**: Added `installDate` field to UserPreferencesV2 and logic to only apply coloring from installation date forward
**Implementation**: 
```typescript
const appInstallDate = installDate || new Date();
if (date < appInstallDate) {
  return theme.isDark ? 'bg-gray-700/50' : 'bg-gray-200/50';
}
```

## Design Patterns & Conventions

### Color Coding System
- **Red**: 0% completion (missed days)
- **Yellow**: Some progress (1-59%)
- **Green**: Good progress (60-99%)
- **Dark Green**: Perfect day (100%)
- **Gray**: Current day, future days, or pre-installation dates

### Animation Patterns
- Framer Motion for all animations
- Staggered delays for list items (`delay: habitIndex * 0.05`)
- Spring animations for interactive elements
- Gradient text effects for high achievement states

### State Management
- Zustand store in `habitStore.ts`
- Service layer abstraction for storage operations
- Error handling with user-friendly messages
- Loading states for async operations

## Commands to Run

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `npm run typecheck`

## File Structure Priority

When working on features, prioritize these key files:
1. `src/components/calendar/HabitCalendarGrid.tsx` - Main weekly interface
2. `src/components/pages/MonthlyCalendarPage.tsx` - Monthly view
3. `src/App.tsx` - Application routing and state
4. `src/stores/habitStore.ts` - Global state management
5. `src/types/index.ts` - TypeScript interfaces

## Feature Ideas & Implementation Details

### 1. Weekly Progress (Current Feature - 4/5 Stars)
**Current Implementation**: Enhanced progress tracking with customizable weekly goals
- **Features**: User-configurable goals (50%-100%), real-time progress calculation, gradient progress bars
- **Future Enhancements**: 
  - Streak tracking and visualizations
  - Weekly goal recommendations based on historical performance
  - Integration with habit difficulty ratings for smart goal adjustment

### 2. AI Insights (Concept - 5/5 Stars)
**Vision**: Intelligent analysis of habit patterns and personalized recommendations
- **Core Features**:
  - Pattern recognition (e.g., "You complete 40% more habits on weekdays")
  - Habit correlation analysis ("Completing Exercise increases your Reading completion by 65%")
  - Personalized goal recommendations
  - Behavioral trend analysis with actionable insights
- **Implementation**: Machine learning analysis of completion data, natural language insights generation
- **UI/UX**: Dashboard with cards showing key insights, trend graphs, and recommendation notifications

### 3. Social Hub (Concept - 5/5 Stars) 
**Vision**: Community-driven habit tracking with social accountability
- **Core Features**:
  - Habit buddy system for mutual accountability
  - Anonymous community leaderboards by habit category
  - Group challenges and competitions
  - Achievement sharing and celebration
  - Community habit templates and recommendations
- **Implementation**: Social features with privacy controls, friend/buddy matching system
- **UI/UX**: Social feed, buddy comparison views, community challenges page

### Removed/Deprecated Features

#### Budget Tracker (Removed - 3/5 Stars)
- **Reason for Removal**: Outside core habit tracking focus, better served by dedicated financial apps
- **Original Concept**: Spending habit tracking with budget goals and financial habit formation

#### Time Tracker (Removed - 4/5 Stars) 
- **Reason for Removal**: Complex feature requiring significant dev effort, time tracking apps already exist
- **Original Concept**: Pomodoro integration with habit completion time tracking

#### Data Export (Removed - 2/5 Stars)
- **Reason for Removal**: Low user demand, complex implementation for CSV/JSON export functionality
- **Original Concept**: Export completion data for external analysis

#### Progress Bar Designs (Removed - 5/5 Stars)
- **Reason for Removal**: Functionality absorbed into main progress bar implementation
- **Achievement**: Successfully implemented enhanced gradient progress bars with animations

## Notes for Future Development

- Always test tooltip positioning on different screen sizes
- Run linting after making changes to catch unused imports
- Maintain the installation date logic for historical accuracy
- Keep animations smooth and purposeful
- Preserve the dark theme as default setting
- Test both weekly and monthly views when making data structure changes
- Weekly goal now configurable via dropdown Actions tab (50%-100% range)
- Progress bar components made more compact and consistent across the app