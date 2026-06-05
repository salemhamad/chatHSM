import React from 'react';
import { PrefetchStatus } from '../../stores/prefetchStore';
import { cn } from '../../lib/utils';
import { Zap, Loader2, Check, AlertTriangle } from 'lucide-react';

interface PrefetchIndicatorProps {
  status: PrefetchStatus;
}

const statusConfig: Record<PrefetchStatus, {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  visible: boolean;
}> = {
  idle: {
    icon: null,
    label: '',
    colorClass: '',
    visible: false,
  },
  warming: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    label: 'Pre-loading context...',
    colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    visible: true,
  },
  ready: {
    icon: <Check className="w-3 h-3" />,
    label: 'Context ready',
    colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    visible: true,
  },
  stale: {
    icon: <Zap className="w-3 h-3" />,
    label: 'Updating context...',
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    visible: true,
  },
  error: {
    icon: <AlertTriangle className="w-3 h-3" />,
    label: 'Pre-load unavailable',
    colorClass: 'text-red-400 border-red-500/20 bg-red-500/5',
    visible: true,
  },
};

export const PrefetchIndicator: React.FC<PrefetchIndicatorProps> = ({ status }) => {
  const config = statusConfig[status];

  if (!config.visible) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border backdrop-blur-sm transition-all duration-500 animate-fadeIn select-none',
        config.colorClass
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
