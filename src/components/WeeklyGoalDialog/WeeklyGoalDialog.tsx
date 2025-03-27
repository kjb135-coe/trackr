import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Slider,
  Box,
} from '@mui/material';

interface WeeklyGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: number) => void;
  currentGoal?: number;
  maxPossibleTracks: number;
}

export const WeeklyGoalDialog: React.FC<WeeklyGoalDialogProps> = ({
  open,
  onClose,
  onSave,
  currentGoal,
  maxPossibleTracks,
}) => {
  const [goal, setGoal] = useState(currentGoal || Math.ceil(maxPossibleTracks * 0.7));

  useEffect(() => {
    if (open) {
      setGoal(currentGoal || Math.ceil(maxPossibleTracks * 0.7));
    }
  }, [open, currentGoal, maxPossibleTracks]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setGoal(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    if (!isNaN(newValue)) {
      setGoal(Math.min(Math.max(1, newValue), maxPossibleTracks));
    }
  };

  const getGoalDescription = () => {
    const percentage = (goal / maxPossibleTracks) * 100;
    if (percentage <= 30) return "Taking it easy - that's okay!";
    if (percentage <= 50) return "A balanced approach!";
    if (percentage <= 70) return "That's a solid goal!";
    if (percentage <= 90) return "Aiming high - you've got this!";
    return "Going for gold! 🌟";
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
      <DialogTitle>Set Weekly Track Goal</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You can achieve up to {maxPossibleTracks} tracks this week. Set a goal that challenges you but remains achievable!
        </Typography>
        
        <Box sx={{ width: '100%', px: 2 }}>
          <Slider
            value={goal}
            onChange={handleSliderChange}
            min={1}
            max={maxPossibleTracks}
            valueLabelDisplay="auto"
            marks={[
              { value: 1, label: '1' },
              { value: maxPossibleTracks, label: maxPossibleTracks.toString() },
            ]}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <TextField
            label="Weekly Goal"
            type="number"
            value={goal}
            onChange={handleInputChange}
            inputProps={{
              min: 1,
              max: maxPossibleTracks,
            }}
            sx={{ width: 120 }}
          />
          <Typography variant="body2" color="primary">
            {getGoalDescription()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(goal)} variant="contained" color="primary">
          Save Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 