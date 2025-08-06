import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationEffectProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'sparkles' | 'ripple';
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ 
  trigger, 
  onComplete,
  type = 'confetti' 
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timeout = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  const renderConfetti = () => {
    const colors = ['from-primary-400 to-secondary-400', 'from-success-400 to-success-600', 'from-accent-400 to-accent-600', 'from-pink-400 to-purple-500'];
    const particles = Array.from({ length: 20 }, (_, i) => (
      <motion.div
        key={i}
        className={`absolute w-3 h-3 rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
        initial={{ 
          x: 0, 
          y: 0, 
          scale: 0, 
          rotate: 0,
          opacity: 1 
        }}
        animate={{
          x: (Math.random() - 0.5) * 300,
          y: -Math.random() * 150 - 75,
          scale: [0, 1.2, 0],
          rotate: Math.random() * 720,
          opacity: [1, 1, 0]
        }}
        transition={{
          duration: 1.2,
          delay: i * 0.03,
          ease: "easeOut"
        }}
      />
    ));
    return particles;
  };

  const renderSparkles = () => {
    const sparkles = Array.from({ length: 8 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1, 0], 
          rotate: [0, 180, 360] 
        }}
        transition={{
          duration: 0.6,
          delay: i * 0.1,
          ease: "easeOut"
        }}
        style={{
          left: `${20 + (i % 3) * 30}%`,
          top: `${20 + Math.floor(i / 3) * 30}%`
        }}
      >
        <span className="text-accent-400 text-xl">✨</span>
      </motion.div>
    ));
    return sparkles;
  };

  const renderRipple = () => (
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-success-400"
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );

  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {type === 'confetti' && renderConfetti()}
          {type === 'sparkles' && renderSparkles()}
          {type === 'ripple' && renderRipple()}
        </div>
      )}
    </AnimatePresence>
  );
};