import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface WeeklyProgressProps {
  currentTracks: number;
  goalTracks: number;
  maxPossibleTracks: number;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  currentTracks,
  goalTracks,
  maxPossibleTracks,
}) => {
  const progress = (currentTracks / goalTracks) * 100;
  
  // Create gradient colors based on progress
  const gradientColors = [
    '#FF9800', // Orange
    '#FFA726', // Light Orange
    '#FFB74D', // Lighter Orange
    '#8BC34A', // Light Green
    '#4CAF50', // Green
    '#2E7D32', // Dark Green
  ];

  const calculateGradient = () => {
    const segments = gradientColors.length - 1;
    const gradientStops = gradientColors.map((color, index) => {
      const percentage = (index / segments) * 100;
      return `${color} ${percentage}%`;
    });
    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Weekly Progress
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {currentTracks} / {goalTracks} tracks
        </Typography>
      </Box>
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Base gradient background */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: calculateGradient(),
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        
        {/* Progress indicator */}
        <Box
          sx={{
            width: `${Math.min(progress, 100)}%`,
            height: '100%',
            bgcolor: 'transparent',
            transition: 'width 0.3s ease',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 2,
              height: '100%',
              bgcolor: 'background.paper',
              display: progress < 100 ? 'block' : 'none',
            },
          }}
        />

        {/* White overlay for unachieved portion */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: `${Math.min(progress, 100)}%`,
            width: `${100 - Math.min(progress, 100)}%`,
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.75)',
            transition: 'left 0.3s ease, width 0.3s ease',
          }}
        />
      </Box>
      {currentTracks > goalTracks && (
        <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
          🎉 Exceeded weekly goal by {currentTracks - goalTracks} tracks!
        </Typography>
      )}
    </Box>
  );
}; 