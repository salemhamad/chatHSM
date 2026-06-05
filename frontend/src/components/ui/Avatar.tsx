'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  isAI?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  status?: 'online' | 'offline' | 'away' | null;
  isThinking?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  fallback, 
  isAI = false, 
  size = 'md', 
  className, 
  status,
  isThinking = false
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('relative shrink-0 select-none', sizes[size], className)}>
      {/* Pulse effect for AI or when thinking */}
      {isAI && (
        <motion.span
          animate={{
            scale: isThinking ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: isThinking ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: isThinking ? 1.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 blur-[4px] z-0"
        />
      )}

      {/* Main Avatar Surface */}
      <div
        className={cn(
          'relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center border z-10 shadow-inner',
          isAI 
            ? 'bg-gradient-to-br from-cyan-500 to-purple-600 border-cyan-400/20 text-white' 
            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-white/80'
        )}
      >
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover select-none" />
        ) : isAI ? (
          <Bot className={iconSizes[size]} />
        ) : fallback ? (
          <span className="font-semibold text-xs uppercase tracking-wider">
            {fallback.substring(0, 2)}
          </span>
        ) : (
          <User className={cn('text-white/60', iconSizes[size])} />
        )}
      </div>

      {/* Online/Offline Status dot */}
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-[#0D0F12] z-20',
            status === 'online' && 'bg-emerald-400',
            status === 'away' && 'bg-amber-400',
            status === 'offline' && 'bg-white/20'
          )}
        />
      )}
    </div>
  );
};
