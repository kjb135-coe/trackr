import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false,
  onClick 
}) => {
  const MotionDiv = motion.div;
  
  return (
    <MotionDiv
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={cn(
        "card p-6",
        hover && "cursor-pointer hover:shadow-2xl",
        className
      )}
    >
      {children}
    </MotionDiv>
  );
};