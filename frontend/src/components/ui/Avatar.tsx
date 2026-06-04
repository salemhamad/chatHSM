import React from 'react';
import { cn } from '../../lib/utils';
import { Bot, User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  isAI?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  status?: 'online' | 'offline' | 'away' | null;
}

export const Avatar: React.FC<AvatarProps> = ({ src, fallback, isAI = false, size = 'md', className, status }) => {
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

  const baseClasses = cn(
    'relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/10 w-full h-full bg-[#1e2025]',
    isAI ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-white/10',
    className
  );

  return (
    <div className={cn("relative shrink-0", sizes[size])}>
      <div className={baseClasses}>
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : isAI ? (
          <Bot className={cn('text-white', iconSizes[size])} />
        ) : fallback ? (
          <span className="font-semibold text-white uppercase">{fallback.substring(0, 2)}</span>
        ) : (
          <User className={cn('text-white/70', iconSizes[size])} />
        )}
      </div>
      {status && (
        <span className={cn(
          "absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-[#0D0F12] z-10 animate-pulse",
          status === 'online' && 'bg-green-400',
          status === 'away' && 'bg-amber-400',
          status === 'offline' && 'bg-gray-400'
        )} />
      )}
    </div>
  );
};

