'use client';

import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ToggleSidebarButton: React.FC = () => {
  const { sidebarOpen, toggleSidebar, direction } = useUIStore();

  return (
    <AnimatePresence>
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, x: direction === 'rtl' ? 50 : -50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: direction === 'rtl' ? 50 : -50 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
          onClick={toggleSidebar}
          className={cn(
            'fixed top-3.5 start-3.5 z-40 p-2.5 rounded-xl text-white shadow-xl cursor-pointer',
            'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500',
            'flex items-center justify-center border border-white/10 md:hidden' // Render only on mobile
          )}
        >
          <ChevronRight className={cn("w-4 h-4", direction === 'rtl' && "rotate-180")} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ToggleSidebarButton;
