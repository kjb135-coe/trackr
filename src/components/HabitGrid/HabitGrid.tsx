import React from 'react';
import { Box, Card, Typography, IconButton, Tooltip, Menu, MenuItem, Zoom, Fade } from '@mui/material';
import { format, startOfWeek, addDays, isToday, isFuture } from 'date-fns';
import { 
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Habit } from '../../types';
import { StreakDisplay } from '../StreakDisplay/StreakDisplay';
import { streakService } from '../../services/streakService';

interface HabitGridProps {
  habits: Habit[];
  onHabitComplete: (habitId: string, date: string, value?: number) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({ 
  habits, 
  onHabitComplete,
  onEditHabit,
  onDeleteHabit
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | { element: HTMLElement; habitId: string }>(null);
  const startDate = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, habitId: string) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, habitId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDelete = () => {
    if (menuAnchor) {
      onDeleteHabit(menuAnchor.habitId);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (menuAnchor) {
      const habit = habits.find(h => h.id === menuAnchor.habitId);
      if (habit) {
        onEditHabit(habit);
        handleMenuClose();
      }
    }
  };

  return (
    <Fade in={true} timeout={800}>
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
            <Box key={index} sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: isToday(day) ? 'action.hover' : 'transparent',
              borderRadius: 1
            }}>
              <Typography variant="subtitle2" color={isToday(day) ? 'primary' : 'inherit'}>
                {format(day, 'EEE')}
              </Typography>
              <Typography variant="caption" color={isToday(day) ? 'primary' : 'inherit'}>
                {format(day, 'M/d')}
              </Typography>
            </Box>
          ))}

          {habits.map((habit) => (
            <React.Fragment key={habit.id}>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
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
                        onClick={(e) => handleMenuOpen(e, habit.id)}
                        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <MoreVertIcon fontSize="small" />
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
              </Zoom>
              
              {weekDays.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const completion = habit.completions[dateStr];
                const isFutureDate = isFuture(day);
                
                return (
                  <Tooltip 
                    key={`${habit.id}-${index}`}
                    title={
                      isFutureDate ? 
                      "Can't mark future days" : 
                      (habit.goal ? `Click to update progress` : `Click to toggle completion`)
                    }
                  >
                    <Box
                      onClick={() => !isFutureDate && onHabitComplete(habit.id, dateStr)}
                      sx={{
                        p: 1,
                        cursor: isFutureDate ? 'not-allowed' : 'pointer',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        bgcolor: completion?.completed ? 'primary.main' : (isToday(day) ? 'action.hover' : 'transparent'),
                        opacity: isFutureDate ? 0.5 : 1,
                        '&:hover': {
                          bgcolor: isFutureDate ? 
                            (isToday(day) ? 'action.hover' : 'transparent') : 
                            (completion?.completed ? 'primary.dark' : 'action.hover'),
                          transform: !isFutureDate ? 'scale(1.05)' : 'none',
                        },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '60px',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: 0,
                          height: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '50%',
                          transform: 'translate(-50%, -50%)',
                          transition: 'width 0.3s ease-out, height 0.3s ease-out',
                        },
                        '&:active::after': {
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                        },
                      }}
                    >
                      <Fade in={completion?.completed} timeout={300}>
                        <Box>
                          {completion?.value !== undefined && (
                            <Typography 
                              variant="caption" 
                              color={completion.completed ? 'white' : 'text.primary'}
                            >
                              {completion.value}/{habit.goal?.target}
                            </Typography>
                          )}
                        </Box>
                      </Fade>
                    </Box>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </Box>

        <Menu
          anchorEl={menuAnchor?.element}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Card>
    </Fade>
  );
}; 