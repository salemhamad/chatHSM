import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const ToggleSidebarButton: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  if (sidebarOpen) return null;
  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        'fixed top-4 start-4 z-50 p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:from-cyan-400 hover:to-purple-500 transition-all',
        'flex items-center gap-1'
      )}
    >
      <ChevronRight className="w-4 h-4" />
      Open Sidebar
    </button>
  );
};

export default ToggleSidebarButton;
