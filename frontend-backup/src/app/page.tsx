"use client";

import { useEffect } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ChatInput } from '../components/input/ChatInput';
import { TopBar } from '../components/chat/TopBar';
import { useUIStore } from '../stores/uiStore';
import { useChatStore } from '../stores/chatStore';

export default function Home() {
  const { toggleSidebar } = useUIStore();
  const { loadConversations } = useChatStore();

  useEffect(() => {
    // Load initial mock data
    loadConversations();

    // Setup keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadConversations, toggleSidebar]);

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-background relative selection:bg-brand-500/30">
      
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300">
        {/* Unified Top Navigation Bar */}
        <TopBar />

        {/* Chat Window Container */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <ChatWindow />
          <ChatInput />
        </div>
      </div>
      
    </main>
  );
}

