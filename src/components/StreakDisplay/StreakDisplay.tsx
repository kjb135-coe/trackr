import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';
import { streakService } from '../../services/streakService';

interface StreakDisplayProps {
  streak: number;
}

const flameAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const StreakContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  opacity: 0,
  animation: 'fadeIn 0.5s ease-in forwards',
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  }
}));

const FireEmoji = styled('span')({
  animation: `${flameAnimation} 1s ease-in-out infinite`,
  display: 'inline-block',
  transformOrigin: 'center'
});

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  if (!streakService.shouldShowStreak(streak)) {
    return null;
  }

  return (
    <StreakContainer>
      <FireEmoji>🔥</FireEmoji>
      <Typography variant="body2" component="span">
        {streak} day{streak !== 1 ? 's' : ''}
      </Typography>
    </StreakContainer>
  );
}; 