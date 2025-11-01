"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggleButton4 } from './skiper-ui/skiper4';

interface ThemeToggleButtonProps {
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ThemeToggleButton4 
      className={className} 
      isDark={isDark}
      onClick={toggleTheme}
    />
  );
};

export default ThemeToggleButton;
