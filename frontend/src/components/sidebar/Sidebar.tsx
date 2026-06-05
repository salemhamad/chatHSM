'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';
import Image from 'next/image';
import { 
  Bot, 
  Plus, 
  PanelLeftClose, 
  Globe, 
  Cpu, 
  Settings, 
  Search, 
  MessageSquare, 
  Pin 
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ChatList } from './ChatList';
import { PinnedMessages } from './PinnedMessages';
import { SettingsPanel } from '../settings/SettingsPanel';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from '../ui/Tooltip';

type SettingsTab = 'account' | 'language' | 'appearance' | 'about';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, closeSidebar, direction } = useUIStore();
  const { createConversation, searchQuery } = useChatStore();
  const { profile } = useUserStore();
  const { t } = useTranslation();
  
  const [selectedModel, setSelectedModel] = useState<'saher4' | 'saher35'>('saher4');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');
  const [isMobile, setIsMobile] = useState(false);

  // Monitor screen size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openSettings = (tab: SettingsTab = 'account') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const handleNewChat = () => {
    createConversation();
    if (isMobile) {
      closeSidebar();
    }
  };

  const profileName = profile?.displayName || t('settings.guestUser');
  const profileEmail = profile?.email?.replace(/@aichat\.com$/, '') || 'guest';
  const usernameInitial = profileName ? profileName.charAt(0).toUpperCase() : '?';

  // Calculate slide transition for mobile based on document direction (LTR/RTL)
  const mobileClosedX = direction === 'rtl' ? '100%' : '-100%';

  return (
    <>
      {/* Mobile background overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Aside */}
      <motion.aside
        initial={isMobile ? { x: mobileClosedX, width: 280 } : { width: 280, x: 0 }}
        animate={
          isMobile
            ? { 
                x: sidebarOpen ? 0 : mobileClosedX, 
                width: 280,
                transition: { type: 'spring' as const, stiffness: 350, damping: 35 }
              }
            : { 
                width: sidebarOpen ? 280 : 72, 
                x: 0,
                transition: { type: 'spring' as const, stiffness: 350, damping: 35 }
              }
        }
        className={cn(
          'fixed md:static inset-y-0 start-0 z-50 flex flex-col h-[100dvh] shrink-0 select-none overflow-hidden',
          'bg-gradient-to-b from-[#0a0a0f]/95 to-[#050508]/95 backdrop-blur-2xl border-e border-white/[0.06] shadow-2xl'
        )}
      >
        <div className="flex-1 flex flex-col min-h-0 w-full">
          
          {/* Header Area */}
          <div className="p-4 flex items-center justify-between shrink-0 h-16 border-b border-white/[0.03]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 relative">
                <Image
                  src="/logo.png"
                  alt="ChatHSM"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg shadow-lg shadow-cyan-500/25 object-cover border border-white/10"
                  priority
                />
              </div>
              {sidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-extrabold text-white tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70"
                >
                  ChatHSM
                </motion.span>
              )}
            </div>

            <Tooltip content={sidebarOpen ? t('sidebar.collapseTooltip') || 'Collapse Sidebar' : t('sidebar.expandTooltip') || 'Expand Sidebar'} position="right">
              <button 
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <PanelLeftClose 
                  className={cn(
                    "w-4 h-4 transition-transform duration-300", 
                    !sidebarOpen && "rotate-180"
                  )} 
                />
              </button>
            </Tooltip>
          </div>

          {/* Prominent Action Button: New Chat */}
          <div className={cn("px-4 pt-4 shrink-0", !sidebarOpen && "px-2.5")}>
            {sidebarOpen ? (
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/15 active:scale-[0.98] cursor-pointer"
                onClick={handleNewChat}
              >
                <Plus className="w-5 h-5" />
                <span>{t('sidebar.newChat')}</span>
              </button>
            ) : (
              <Tooltip content={t('sidebar.newChat')} position="right">
                <button 
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md shadow-cyan-500/10 active:scale-[0.96] mx-auto cursor-pointer"
                  onClick={handleNewChat}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Search Section */}
          <div className={cn("px-4 pt-3 shrink-0", !sidebarOpen && "px-2 pt-4")}>
            {sidebarOpen ? (
              <SearchBar />
            ) : (
              <Tooltip content={t('sidebar.searchPlaceholder')} position="right">
                <button 
                  onClick={toggleSidebar}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] text-white/50 hover:text-white/80 mx-auto cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Scrollable Center Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-5 px-2">
            
            {/* AI Model Switcher Section */}
            <div className={cn("px-2", !sidebarOpen && "px-1")}>
              {sidebarOpen && (
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 block mb-2">
                  {t('sidebar.modelsTitle')}
                </span>
              )}
              
              <div className={cn(
                "flex flex-col gap-1 p-1 bg-white/[0.02] border border-white/[0.04] rounded-xl",
                !sidebarOpen && "items-center border-none bg-transparent p-0 gap-2"
              )}>
                {/* Saher 4.0 Option */}
                {sidebarOpen ? (
                  <button
                    onClick={() => setSelectedModel('saher4')}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      selectedModel === 'saher4'
                        ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{t('sidebar.model4')}</span>
                    </div>
                    {selectedModel === 'saher4' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </button>
                ) : (
                  <Tooltip content={t('sidebar.model4')} position="right">
                    <button
                      onClick={() => { setSelectedModel('saher4'); toggleSidebar(); }}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-lg border transition-all cursor-pointer",
                        selectedModel === 'saher4'
                          ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                          : "bg-white/[0.01] border-white/[0.05] text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                      )}
                    >
                      <Cpu className="w-4 h-4" />
                    </button>
                  </Tooltip>
                )}

                {/* Saher 3.5 Option */}
                {sidebarOpen ? (
                  <button
                    onClick={() => setSelectedModel('saher35')}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      selectedModel === 'saher35'
                        ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5" />
                      <span>{t('sidebar.model35')}</span>
                    </div>
                    {selectedModel === 'saher35' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </button>
                ) : (
                  <Tooltip content={t('sidebar.model35')} position="right">
                    <button
                      onClick={() => { setSelectedModel('saher35'); toggleSidebar(); }}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-lg border transition-all cursor-pointer",
                        selectedModel === 'saher35'
                          ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                          : "bg-white/[0.01] border-white/[0.05] text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                      )}
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Pinned Messages Section */}
            {sidebarOpen && <PinnedMessages />}

            {/* Chats List Section */}
            <div>
              {sidebarOpen && (
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 block mb-2">
                  {t('sidebar.previousChats')}
                </span>
              )}
              <ChatList collapsed={!sidebarOpen} />
            </div>

          </div>

          {/* Bottom Settings & User Profile Footer */}
          <div className="p-3 border-t border-white/[0.03] shrink-0 bg-[#060609]/60 flex flex-col gap-1.5">
            {/* User Profile Trigger Button */}
            {sidebarOpen ? (
              <button 
                onClick={() => openSettings('account')}
                className="flex items-center gap-3 w-full p-2 hover:bg-white/[0.04] rounded-xl text-sm text-white/70 hover:text-white transition-all text-start group cursor-pointer"
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
            ) : (
              <Tooltip content={profileName} position="right">
                <button 
                  onClick={() => openSettings('account')}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/30 text-xs font-semibold text-white/80 mx-auto transition-colors cursor-pointer"
                >
                  {usernameInitial}
                </button>
              </Tooltip>
            )}

            {/* Settings Quick Buttons Row */}
            <div className={cn(
              "flex items-center justify-between gap-1 pt-1 border-t border-white/[0.03]",
              !sidebarOpen && "flex-col border-none pt-0 gap-2"
            )}>
              {/* Language toggler */}
              {sidebarOpen ? (
                <button 
                  onClick={() => openSettings('language')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 hover:bg-white/[0.04] rounded-lg text-[11px] text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <Globe className="w-3 h-3 text-white/50" />
                  <span>{t('sidebar.languageTooltip')}</span>
                </button>
              ) : (
                <Tooltip content={t('sidebar.languageTooltip')} position="right">
                  <button 
                    onClick={() => openSettings('language')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/60 hover:text-white cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}

              {/* General Settings Button */}
              {sidebarOpen ? (
                <button 
                  onClick={() => openSettings('account')}
                  className="p-1.5 hover:bg-white/[0.04] rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
                  title={t('sidebar.settingsTooltip')}
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Tooltip content={t('sidebar.settingsTooltip')} position="right">
                  <button 
                    onClick={() => openSettings('account')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] text-white/60 hover:text-white cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>

          </div>
        </div>
      </motion.aside>

      {/* Settings Dialog Overlay */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            initialTab={settingsTab}
          />
        )}
      </AnimatePresence>
    </>
  );
};
