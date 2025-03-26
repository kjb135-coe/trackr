import React from 'react';
import { Box, Card, Typography, IconButton, Tooltip } from '@mui/material';
import { format, startOfWeek, addDays } from 'date-fns';
import { Edit as EditIcon } from '@mui/icons-material';
import { Habit } from '../../types';
import { StreakDisplay } from '../StreakDisplay/StreakDisplay';
import { streakService } from '../../services/streakService';

interface HabitGridProps {
  habits: Habit[];
  onHabitComplete: (habitId: string, date: string, value?: number) => void;
  onEditHabit: (habit: Habit) => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({ 
  habits, 
  onHabitComplete,
  onEditHabit 
}) => {
  const startDate = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <Card sx={{ p: 2, mt: 2 }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(250px, 1fr) repeat(7, 1fr)',
        gap: 1
      }}>
        <Box sx={{ gridColumn: '1', p: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Habits</Typography>
        </Box>
        
        {weekDays.map((day, index) => (
          <Box key={index} sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="subtitle2">{format(day, 'EEE')}</Typography>
            <Typography variant="caption">{format(day, 'M/d')}</Typography>
          </Box>
        ))}

        {habits.map((habit) => (
          <React.Fragment key={habit.id}>
            <Box sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid',
              borderColor: 'divider',
              minHeight: '60px'
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>{habit.name}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => onEditHabit(habit)}
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                {streakService.shouldShowStreak(habit.streak) && (
                  <StreakDisplay streak={habit.streak} />
                )}
                {habit.goal && (
                  <Typography variant="caption" color="text.secondary">
                    Goal: {habit.goal.target} {habit.goal.unit}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {weekDays.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const completion = habit.completions[dateStr];
              
              return (
                <Tooltip 
                  key={`${habit.id}-${index}`}
                  title={habit.goal ? `Click to update progress` : `Click to toggle completion`}
                >
                  <Box
                    onClick={() => onHabitComplete(habit.id, dateStr)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      bgcolor: completion?.completed ? 'primary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: completion?.completed ? 'primary.dark' : 'action.hover',
                      },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '60px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {completion?.value !== undefined && (
                      <Typography 
                        variant="caption" 
                        color={completion.completed ? 'white' : 'text.primary'}
                      >
                        {completion.value}/{habit.goal?.target}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Card>
  );
}; 