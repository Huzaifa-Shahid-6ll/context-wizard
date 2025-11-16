"use client";

/**
 * Icon Wrapper Component
 * Wraps Lineicons to provide Lucide-compatible API
 */
import React from 'react';
import { Lineicons } from '@lineiconshq/react-lineicons';
import type { IconComponent } from './iconMapping';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'icon'> {
  icon: IconComponent;
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

/**
 * Wrapper component that makes Lineicons work like Lucide icons
 * Handles size, color, and className props consistently
 */
export const IconWrapper = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon,
      size = 24,
      strokeWidth = 1.5,
      className = '',
      color,
      style,
      ...props
    },
    ref
  ) => {
    // Extract size from className if present (e.g., "h-4 w-4")
    let sizeValue: number = 24;
    if (size) {
      sizeValue = typeof size === 'string' 
        ? parseInt(size.replace(/[^0-9]/g, ''), 10) || 24
        : size;
    } else if (className) {
      // Try to extract from Tailwind classes like h-4, w-4
      const sizeMatch = className.match(/(?:^|\s)(?:h|w)-(\d+)(?:\s|$)/);
      if (sizeMatch) {
        sizeValue = parseInt(sizeMatch[1], 10) * 4; // Convert Tailwind size to pixels
      }
    }

    // Extract color from className if present (e.g., "text-primary")
    const finalColor = color || (style?.color as string) || 'currentColor';

    return (
      <Lineicons
        ref={ref}
        icon={icon}
        size={sizeValue}
        strokeWidth={strokeWidth}
        color={finalColor}
        className={className}
        style={style}
        {...props}
      />
    );
  }
);

IconWrapper.displayName = 'IconWrapper';

