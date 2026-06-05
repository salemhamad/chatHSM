import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';
import Image from 'next/image';
import { Bot, Plus, PanelLeftClose, Globe, Cpu, Settings } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ChatList } from './ChatList';
import { PinnedMessages } from './PinnedMessages';
import { SettingsPanel } from '../settings/SettingsPanel';
import { cn } from '../../lib/utils';

type SettingsTab = 'account' | 'language' | 'appearance' | 'about';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { createConversation } = useChatStore();
  const { profile } = useUserStore();
  const { t } = useTranslation();
  
  // State for active AI model selection
  const [selectedModel, setSelectedModel] = useState<'saher4' | 'saher35'>('saher4');

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');

  const openSettings = (tab: SettingsTab = 'account') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const handleNewChat = () => {
    createConversation();
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  const profileName = profile?.displayName || t('settings.guestUser');
  const profileEmail = profile?.email?.replace(/@aichat\.com$/, '') || 'guest';
  const usernameInitial = profileName ? profileName.charAt(0).toUpperCase() : '?';

  return (
    <>
      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={cn(
          'fixed md:static inset-y-0 start-0 z-50 w-[280px] flex flex-col h-[100dvh] transition-transform duration-300 ease-in-out glass-panel border-r border-gray-800 border-y-0 border-l-0 shrink-0 select-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 rtl:translate-x-full rtl:md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:border-none'
        )}
      >
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Top Logo and Header */}
          <div className="p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ChatHSM"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg shadow-lg shadow-cyan-500/20 object-cover"
                priority
              />
              <span className="font-extrabold text-white tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                ChatHSM
              </span>
            </div>
            <button 
              onClick={closeSidebar}
              className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <PanelLeftClose className="w-5 h-5 rtl:-scale-x-100" />
            </button>
          </div>

          {/* New Chat Top Prominent Button */}
          <div className="px-4 pb-4 shrink-0">
            <button 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
              onClick={handleNewChat}
            >
              <Plus className="w-5 h-5" />
              <span>{t('sidebar.newChat')}</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-2 shrink-0">
            <SearchBar />
          </div>

          {/* Collapsible history section */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4 space-y-6">
            
            {/* AI Model Switcher Section */}
            <div className="px-2 pt-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 block mb-2">
                {t('sidebar.modelsTitle')}
              </span>
              
              <div className="flex flex-col gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                {/* Saher 4.0 Button */}
                <button
                  onClick={() => setSelectedModel('saher4')}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg text-sm text-start font-medium transition-all",
                    selectedModel === 'saher4'
                      ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-400"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    <span>{t('sidebar.model4')}</span>
                  </div>
                  {selectedModel === 'saher4' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>

                {/* Saher 3.5 Button */}
                <button
                  onClick={() => setSelectedModel('saher35')}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg text-sm text-start font-medium transition-all",
                    selectedModel === 'saher35'
                      ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-400"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>{t('sidebar.model35')}</span>
                  </div>
                  {selectedModel === 'saher35' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {/* Pinned Messages */}
            <PinnedMessages />

            {/* Conversation History */}
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-4 block mb-2">
                {t('sidebar.previousChats')}
              </span>
              <ChatList />
            </div>

          </div>

          {/* Bottom Footer Section: Profile & Settings */}
          <div className="p-3 border-t border-white/5 shrink-0 bg-[#0c0d10] flex flex-col gap-2">
            
            {/* Edit Profile / Account Info button */}
            <button 
              onClick={() => openSettings('account')}
              className="flex items-center gap-3 w-full p-2.5 hover:bg-white/5 rounded-xl text-sm text-white/70 hover:text-white transition-all text-start group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white/80 group-hover:border-cyan-500/30 transition-colors">
                {usernameInitial}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-white/90 truncate text-xs">
                  {profileName}
                </span>
                <span className="text-[10px] text-white/30 truncate">{profileEmail}</span>
              </div>
            </button>

            {/* Language and Settings buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.03]">
              {/* Language Switch */}
              <button 
                onClick={() => openSettings('language')}
                className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-white/5 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t('sidebar.languageTooltip')}</span>
              </button>

              {/* General Settings button */}
              <button 
                onClick={() => openSettings('account')}
                className="flex items-center justify-center p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
                title={t('sidebar.settingsTooltip')}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </aside>

      {/* Settings Panel (Modal) */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </>
  );
};
