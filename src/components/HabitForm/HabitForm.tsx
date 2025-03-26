import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Habit, Tag, DEFAULT_TAGS } from '../../types';

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  editHabit?: Habit;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  open,
  onClose,
  onSave,
  editHabit
}) => {
  const [name, setName] = useState(editHabit?.name || '');
  const [tag, setTag] = useState(editHabit?.tag || DEFAULT_TAGS[0].id);
  const [goal, setGoal] = useState(editHabit?.goal?.target || '');
  const [unit, setUnit] = useState(editHabit?.goal?.unit || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habitData: Habit = {
      id: editHabit?.id || uuidv4(),
      name,
      tag,
      streak: editHabit?.streak || 0,
      completions: editHabit?.completions || {},
      createdAt: editHabit?.createdAt || Date.now(),
      ...(goal && unit ? {
        goal: {
          type: 'quantity',
          target: Number(goal),
          unit
        }
      } : {})
    };

    onSave(habitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editHabit ? 'Edit Habit' : 'Add New Habit'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Habit Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={tag}
                label="Category"
                onChange={(e) => setTag(e.target.value)}
              >
                {DEFAULT_TAGS.map((tag: Tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Goal (optional)"
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                fullWidth
              />
              <TextField
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                fullWidth
                placeholder="pages, minutes, etc."
                disabled={!goal}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!name || !tag}>
            {editHabit ? 'Save Changes' : 'Add Habit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 