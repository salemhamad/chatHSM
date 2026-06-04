import React from 'react';
import { Menu, Plus, Settings, Sparkles } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';

export const TopBar: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { createConversation } = useChatStore();
  const { t } = useTranslation();

  const handleNewChat = () => {
    createConversation();
  };

  return (
    <header className="w-full h-16 bg-[#12141c] border-b border-gray-800 flex items-center justify-between px-4 md:px-6 z-30 shrink-0 select-none">
      {/* Drawer trigger trigger */}
      <div className="flex items-center gap-3">
        <Tooltip content={t('sidebar.toggleSidebar')}>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-800 rounded-lg text-white/70 hover:text-white transition-all active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </Tooltip>
      </div>

      {/* Middle logo and title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <span className="font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 text-lg md:text-xl">
          ChatHSM
        </span>
      </div>

      {/* End actions: New Chat + Settings + Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 rounded-xl font-medium text-sm text-white transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
          aria-label="New Chat"
        >
          <span className="hidden sm:inline">{t('sidebar.newChat')}</span>
          <Plus className="w-4 h-4" />
        </button>

        {/* Settings toggle button */}
        <Tooltip content={t('settings.title')}>
          <button
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </Tooltip>

        {/* User Avatar */}
        <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <Avatar 
            src={null} 
            size="sm" 
            status="online"
          />
        </div>
      </div>
    </header>
  );
};
