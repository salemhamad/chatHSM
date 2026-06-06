'use client';

import React, { useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { ArrowDown, MessageSquarePlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWindow: React.FC = () => {
  const { messages, activeConversationId, loadMessages, isStreaming, streamingContent, isLoading } = useChatStore();
  const { t } = useTranslation();
  const { scrollRef, isAtBottom, scrollToBottom } = useAutoScroll<HTMLDivElement>();

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, streamingContent, isAtBottom, scrollToBottom]);

  if (!activeConversationId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none"
      >
        {/* Square background video player with neon glow */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
          className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden logo-neon-shadow border border-white/10 bg-black relative mb-8"
        >
          <video
            src="/background.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center select-none"
          />
        </motion.div>
        
        <h2 className="text-3xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/95 to-white/70">
          {t('chat.welcomeTitle')}
        </h2>
        <p className="text-white/40 text-sm max-w-sm mb-10 leading-relaxed">
          {t('chat.welcomeDesc')}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {[
            t('chat.suggestedPrompt1'),
            t('chat.suggestedPrompt2'),
            t('chat.suggestedPrompt3'),
            t('chat.suggestedPrompt4')
          ].map((prompt, i) => (
            <motion.button 
              key={i}
              whileHover={{ scale: 1.015, translateY: -2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)' }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-colors text-start text-sm text-white/70 hover:text-white group flex flex-col justify-between h-24 cursor-pointer"
              onClick={() => {
                const chatStore = useChatStore.getState();
                chatStore.sendMessage(prompt);
              }}
            >
              <MessageSquarePlus className="w-4 h-4 text-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              <span>{prompt}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden bg-transparent">
      {/* Scrollable message area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32"
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div 
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 animate-pulse"
            >
              <div className="h-20 bg-white/5 rounded-2xl w-3/4 self-end border border-white/5" />
              <div className="h-28 bg-white/5 rounded-2xl w-3/4 self-start border border-white/5" />
            </motion.div>
          ) : (
            messages.map((msg) => (
              msg.role === 'USER' 
                ? <UserMessage key={msg.id} message={msg} />
                : <AIMessage key={msg.id} message={msg} />
            ))
          )}

          {isStreaming && streamingContent && (
            <AIMessage 
              key="streaming"
              message={{
                id: 'streaming',
                role: 'ASSISTANT',
                content: streamingContent,
                isStreaming: true,
                conversationId: activeConversationId,
                userId: 'system',
                attachments: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Floating scroll to bottom button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10"
          >
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full w-10 h-10 shadow-2xl bg-[#08080c]/90 backdrop-blur-xl border border-white/10 text-white cursor-pointer"
              onClick={scrollToBottom}
            >
              <ArrowDown className="w-4 h-4 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
