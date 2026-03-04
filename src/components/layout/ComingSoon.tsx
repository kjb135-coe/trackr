import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ComingSoonProps {
  feature: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ feature }) => {
  const theme = useThemeClasses();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Construction className={`w-12 h-12 mx-auto ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <h2 className={`text-2xl font-semibold ${theme.textPrimary}`}>{feature}</h2>
        <p className={`${theme.textSecondary} text-sm`}>Coming soon</p>
      </motion.div>
    </div>
  );
};
