import React, { useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { ArrowDown, MessageSquarePlus } from 'lucide-react';
import { Button } from '../ui/Button';

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
    // Auto-scroll when new messages arrive or streaming content changes
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, streamingContent, isAtBottom, scrollToBottom]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fadeIn select-none">
        {/* Square background video player with neon glow */}
        <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl overflow-hidden logo-neon-shadow border border-white/10 bg-black relative mb-8">
          <video
            src="/background.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center select-none"
          />
        </div>
        
        <h2 className="text-3xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
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
            <button 
              key={i}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-start text-sm text-white/70 hover:text-white group flex flex-col justify-between h-24"
              onClick={() => {
                const chatStore = useChatStore.getState();
                chatStore.sendMessage(prompt);
              }}
            >
              <MessageSquarePlus className="w-4 h-4 text-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden bg-background">
      {/* Scrollable message area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32"
      >
        {isLoading ? (
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-24 bg-white/5 rounded-2xl w-3/4 self-end" />
            <div className="h-32 bg-white/5 rounded-2xl w-3/4 self-start" />
          </div>
        ) : (
          messages.map((msg) => (
            msg.role === 'USER' 
              ? <UserMessage key={msg.id} message={msg} />
              : <AIMessage key={msg.id} message={msg} />
          ))
        )}

        {isStreaming && streamingContent && (
          <AIMessage 
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
      </div>

      {/* Floating scroll to bottom button */}
      {!isAtBottom && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 animate-slideUp">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full w-10 h-10 shadow-2xl bg-gray-900/80 backdrop-blur-md"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};
