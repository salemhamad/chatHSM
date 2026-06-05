'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'transition'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
  transition?: any;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: 'gradient-btn text-white shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25',
      secondary: 'bg-white/[0.03] hover:bg-white/[0.08] text-white/90 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] shadow-md shadow-black/10',
      ghost: 'bg-transparent hover:bg-white/[0.05] text-white/80 hover:text-white',
      outline: 'bg-transparent border border-white/[0.15] hover:border-white/[0.25] text-white/80 hover:text-white hover:bg-white/[0.04]',
      danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/20 shadow-md shadow-red-500/5',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2 rounded-xl text-sm gap-2',
      lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
      icon: 'p-2 rounded-xl flex items-center justify-center aspect-square',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
