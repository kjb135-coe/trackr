import React, { useEffect, useState, useMemo } from 'react';
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
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  TrackChanges as GoalIcon,
} from '@mui/icons-material';
import { lightTheme, darkTheme } from './theme';
import { HabitGrid } from './components/HabitGrid/HabitGrid';
import { HabitForm } from './components/HabitForm/HabitForm';
import { Tutorial } from './components/Tutorial/Tutorial';
import { WeeklyProgress } from './components/WeeklyProgress/WeeklyProgress';
import { WeeklyGoalDialog } from './components/WeeklyGoalDialog/WeeklyGoalDialog';
import { storageService } from './services/storage';
import { streakService } from './services/streakService';
import { Habit } from './types';
import { startOfWeek, addDays, isFuture, format } from 'date-fns';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [weeklyGoal, setWeeklyGoal] = useState<number>(0);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedHabits = await storageService.getHabits();
        const prefs = await storageService.getPreferences();
        setIsDarkMode(prefs.theme === 'dark');
        setHabits(storedHabits);
        setIsTutorialOpen(prefs.showTutorial);
        setUserName(prefs.name || '');
        setWeeklyGoal(prefs.weeklyTrackGoal || Math.ceil(storedHabits.length * 7 * 0.7));
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

  const handleCloseTutorial = async (shouldOpenHabitForm = false) => {
    setIsTutorialOpen(false);
    await storageService.savePreferences({
      theme: isDarkMode ? 'dark' : 'light',
      showTutorial: false,
      name: userName,
      weeklyTrackGoal: weeklyGoal
    });
    if (shouldOpenHabitForm) {
      setIsFormOpen(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await storageService.savePreferences({
      theme: newTheme ? 'dark' : 'light',
      showTutorial: false
    });
  };

  const handleSaveWeeklyGoal = async (goal: number) => {
    setWeeklyGoal(goal);
    setIsGoalDialogOpen(false);
    await storageService.savePreferences({
      theme: isDarkMode ? 'dark' : 'light',
      showTutorial: false,
      name: userName,
      weeklyTrackGoal: goal
    });
  };

  const handleUpdateName = async (name: string) => {
    setUserName(name);
    await storageService.savePreferences({
      theme: isDarkMode ? 'dark' : 'light',
      showTutorial: false,
      name: name,
      weeklyTrackGoal: weeklyGoal
    });
  };

  const weeklyStats = useMemo(() => {
    if (habits.length === 0) return { currentTracks: 0, maxPossibleTracks: 0 };
    
    const startDate = startOfWeek(new Date());
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    const today = new Date();
    
    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
      weekDays.forEach(day => {
        if (!isFuture(day)) {
          totalPossible++;
          const dateStr = format(day, 'yyyy-MM-dd');
          if (habit.completions[dateStr]?.completed) {
            totalCompleted++;
          }
        }
      });
    });

    return {
      currentTracks: totalCompleted,
      maxPossibleTracks: totalPossible
    };
  }, [habits]);

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await storageService.deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      setError('Failed to delete habit. Please try again.');
    }
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleAddHabit = () => {
    setSettingsAnchor(null);
    setIsFormOpen(true);
  };

  const handleOpenGoalDialog = () => {
    setSettingsAnchor(null);
    setIsGoalDialogOpen(true);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="inherit" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {userName ? `${userName}'s Trackr` : 'Trackr'}
            </Typography>
            <IconButton 
              onClick={handleSettingsClick}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={settingsAnchor}
              open={Boolean(settingsAnchor)}
              onClose={handleSettingsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleAddHabit}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add Habit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleOpenGoalDialog}>
                <ListItemIcon>
                  <GoalIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Set Weekly Goal</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Typography>Loading your habits...</Typography>
            </Box>
          ) : (
            <Fade in={!isLoading} timeout={500}>
              <Box>
                <WeeklyProgress
                  currentTracks={weeklyStats.currentTracks}
                  goalTracks={weeklyGoal}
                  maxPossibleTracks={weeklyStats.maxPossibleTracks}
                />
                <HabitGrid
                  habits={habits}
                  onHabitComplete={handleHabitComplete}
                  onEditHabit={handleEditHabit}
                  onDeleteHabit={handleDeleteHabit}
                />
              </Box>
            </Fade>
          )}
        </Container>

        <Fab
          color="inherit"
          aria-label="toggle theme"
          onClick={toggleTheme}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'background.paper',
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </Fab>

        <Tutorial
          open={isTutorialOpen}
          onClose={handleCloseTutorial}
          onNameChange={handleUpdateName}
          onWeeklyGoalChange={handleSaveWeeklyGoal}
        />

        <HabitForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveHabit}
          editHabit={editingHabit}
        />

        <WeeklyGoalDialog
          open={isGoalDialogOpen}
          onClose={() => setIsGoalDialogOpen(false)}
          onSave={handleSaveWeeklyGoal}
          currentGoal={weeklyGoal}
          maxPossibleTracks={weeklyStats.maxPossibleTracks}
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