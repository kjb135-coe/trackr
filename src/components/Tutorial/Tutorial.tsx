import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField,
  Slide,
  Fade,
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  CheckCircleOutline as CheckIcon,
  LocalFireDepartment as FireIcon,
  Visibility as ViewIcon,
  EmojiEvents as TrophyIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';

interface TutorialProps {
  open: boolean;
  onClose: (openHabitForm?: boolean) => void;
  onNameChange: (name: string) => void;
  onWeeklyGoalChange: (goal: number) => void;
}

const TUTORIAL_STEPS = [
  {
    title: "Let's Get Started!",
    description: "First, tell us your name so we can make Trackr feel more personal.",
    icon: <ViewIcon color="primary" />,
    requiresName: true,
  },
  {
    title: 'Welcome to Trackr!',
    description: "Your personal habit tracking companion. We'll help you build and maintain great habits!",
    icon: <ViewIcon color="primary" />,
  },
  {
    title: 'Add Your Habits',
    description: 'Click the + button to add habits you want to track. You can add up to 6 habits in the free version.',
    icon: <AddIcon color="primary" />,
  },
  {
    title: 'Understanding Tracks',
    description: "A 'track' is what we call each daily habit completion. Think of it like leaving footprints on your journey to success! If you have 3 habits, you can get up to 3 tracks per day - one for each habit you complete. 🎯",
    icon: <TrophyIcon color="primary" />,
  },
  {
    title: 'Weekly Goals',
    description: "Set a weekly goal for how many tracks you want to achieve. If you have 3 habits, that's up to 21 possible tracks per week (3 habits × 7 days). Watch the progress bar fill with beautiful colors as you reach your goal! 🌈",
    icon: <TrophyIcon color="primary" />,
  },
  {
    title: 'Track Daily Progress',
    description: 'Click on the cells in the grid to mark habits as complete. For habits with goals, enter your progress.',
    icon: <CheckIcon color="primary" />,
  },
  {
    title: 'Build Streaks',
    description: 'Complete habits consistently to build streaks. A fire icon will appear after 3 consecutive days! 🔥',
    icon: <FireIcon color="primary" sx={{ color: '#ff9800' }} />,
  },
  {
    title: "Let's Begin Your Journey!",
    description: "Ready to start building better habits? Let's add your first habit and set a weekly goal!",
    icon: <FlagIcon color="primary" />,
    isLastStep: true,
  },
];

export const Tutorial: React.FC<TutorialProps> = ({ open, onClose, onNameChange, onWeeklyGoalChange }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleNext = () => {
    if (TUTORIAL_STEPS[activeStep].requiresName && !name.trim()) {
      setNameError('Please enter your name');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    setActiveStep(0);
    onClose(true); // true indicates to open the habit form
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    if (nameError) setNameError('');
    onNameChange(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (TUTORIAL_STEPS[activeStep].requiresName) {
        handleNext();
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose()}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        },
      }}
    >
      <Fade in={open} timeout={600}>
        <DialogTitle sx={{ textAlign: 'center', pb: 3 }}>
          {TUTORIAL_STEPS[activeStep].title}
        </DialogTitle>
      </Fade>

      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {TUTORIAL_STEPS.map((step, index) => (
            <Step key={index}>
              <StepLabel>{}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Fade in={true} timeout={600}>
          <Paper 
            elevation={0} 
            sx={{ 
              mt: 4, 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              bgcolor: 'background.default',
              borderRadius: 2,
            }}
          >
            <Box sx={{ mb: 2, fontSize: '48px' }}>
              {TUTORIAL_STEPS[activeStep].icon}
            </Box>
            <Typography variant="body1" textAlign="center" sx={{ mb: 2 }}>
              {TUTORIAL_STEPS[activeStep].description}
            </Typography>
            {TUTORIAL_STEPS[activeStep].requiresName && (
              <Slide direction="up" in={true}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={name}
                  onChange={handleNameChange}
                  onKeyPress={handleKeyPress}
                  error={!!nameError}
                  helperText={nameError}
                  sx={{ mt: 2 }}
                  autoFocus
                />
              </Slide>
            )}
          </Paper>
        </Fade>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        {TUTORIAL_STEPS[activeStep].isLastStep ? (
          <Button 
            onClick={handleFinish}
            variant="contained"
            color="primary"
          >
            Add Your First Habit
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 