import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { HabitsPage } from './components/pages/HabitsPage';
import { MonthlyCalendarPage } from './components/pages/MonthlyCalendarPage';
import { SleepPage } from './components/sleep/SleepPage';
import { ExercisePage } from './components/exercise/ExercisePage';
import { JournalPage } from './components/journal/JournalPage';
import { NutritionPage } from './components/nutrition/NutritionPage';
import { DashboardPage } from './components/dashboard/DashboardPage';

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HabitsPage />} />
            <Route path="monthly" element={<MonthlyCalendarPage />} />
            <Route path="sleep" element={<SleepPage />} />
            <Route path="exercise" element={<ExercisePage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="nutrition" element={<NutritionPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
