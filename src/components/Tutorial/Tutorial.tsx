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
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  CheckCircleOutline as CheckIcon,
  LocalFireDepartment as FireIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface TutorialProps {
  open: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Trackr!',
    description: 'Your personal habit tracking companion. Let\'s get you started with a quick tour.',
    icon: <ViewIcon color="primary" />,
  },
  {
    title: 'Add Your Habits',
    description: 'Click the + button to add habits you want to track. You can add up to 6 habits in the free version.',
    icon: <AddIcon color="primary" />,
  },
  {
    title: 'Track Daily Progress',
    description: 'Click on the cells in the grid to mark habits as complete. For habits with goals, enter your progress.',
    icon: <CheckIcon color="primary" />,
  },
  {
    title: 'Build Streaks',
    description: 'Complete habits consistently to build streaks. A fire icon will appear after 3 consecutive days!',
    icon: <FireIcon color="primary" sx={{ color: '#ff9800' }} />,
  },
];

export const Tutorial: React.FC<TutorialProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 3 }}>
        {TUTORIAL_STEPS[activeStep].title}
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {TUTORIAL_STEPS.map((step, index) => (
            <Step key={index}>
              <StepLabel>{}</StepLabel>
            </Step>
          ))}
        </Stepper>

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
          <Typography variant="body1" textAlign="center">
            {TUTORIAL_STEPS[activeStep].description}
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        {activeStep === TUTORIAL_STEPS.length - 1 ? (
          <Button 
            onClick={handleFinish}
            variant="contained"
          >
            Get Started
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