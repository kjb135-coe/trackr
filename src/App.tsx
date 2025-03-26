import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Fab,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { lightTheme, darkTheme } from './theme';
import { HabitGrid } from './components/HabitGrid/HabitGrid';
import { HabitForm } from './components/HabitForm/HabitForm';
import { Tutorial } from './components/Tutorial/Tutorial';
import { storageService } from './services/storage';
import { streakService } from './services/streakService';
import { Habit } from './types';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedHabits = await storageService.getHabits();
        const prefs = await storageService.getPreferences();
        setIsDarkMode(prefs.theme === 'dark');
        setHabits(storedHabits);
        setIsTutorialOpen(prefs.showTutorial);
      } catch (err) {
        setError('Failed to load your habits. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHabitComplete = async (habitId: string, date: string, value?: number) => {
    try {
      const habitIndex = habits.findIndex(h => h.id === habitId);
      if (habitIndex === -1) return;

      const habit = habits[habitIndex];
      const newHabit = {
        ...habit,
        completions: {
          ...habit.completions,
          [date]: {
            completed: !habit.completions[date]?.completed,
            value: value ?? habit.completions[date]?.value
          }
        }
      };

      const updatedHabit = streakService.updateHabitStreak(newHabit);
      const newHabits = [...habits];
      newHabits[habitIndex] = updatedHabit;
      
      setHabits(newHabits);
      await storageService.saveHabits(newHabits);
    } catch (err) {
      setError('Failed to update habit. Please try again.');
    }
  };

  const handleSaveHabit = async (habitData: Habit) => {
    try {
      if (editingHabit) {
        const newHabits = habits.map(h => 
          h.id === habitData.id ? habitData : h
        );
        setHabits(newHabits);
        await storageService.saveHabits(newHabits);
      } else {
        await storageService.addHabit(habitData);
        const updatedHabits = await storageService.getHabits();
        setHabits(updatedHabits);
      }
      handleCloseForm();
    } catch (err) {
      if (err instanceof Error && err.message.includes('limited to 6 habits')) {
        setError('Free version is limited to 6 habits. Upgrade to add more!');
      } else {
        setError('Failed to save habit. Please try again.');
      }
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(undefined);
  };

  const handleCloseTutorial = async () => {
    setIsTutorialOpen(false);
    await storageService.savePreferences({
      theme: isDarkMode ? 'dark' : 'light',
      showTutorial: false
    });
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await storageService.savePreferences({
      theme: newTheme ? 'dark' : 'light',
      showTutorial: false
    });
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="inherit" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Trackr
            </Typography>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Typography>Loading your habits...</Typography>
            </Box>
          ) : (
            <HabitGrid
              habits={habits}
              onHabitComplete={handleHabitComplete}
              onEditHabit={handleEditHabit}
            />
          )}
        </Container>

        <Fab
          color="primary"
          aria-label="add habit"
          onClick={() => setIsFormOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>

        <HabitForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveHabit}
          editHabit={editingHabit}
        />

        <Tutorial
          open={isTutorialOpen}
          onClose={handleCloseTutorial}
        />

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App; 