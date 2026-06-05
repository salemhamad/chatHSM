'use client';

import React from 'react';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useDirection } from '../../hooks/useDirection';
import { MessageActions } from './MessageActions';
import { StreamingText } from './StreamingText';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { useChatStore } from '../../stores/chatStore';
import { FancyMarkdown } from '../ui/FancyMarkdown';
import { motion } from 'framer-motion';

interface AIMessageProps {
  message: Message;
}

const SUGGESTION_KEYS = [
  { labelKey: 'input.suggestSummarize', promptKey: 'input.suggestSummarizePrompt' },
  { labelKey: 'input.suggestExplain', promptKey: 'input.suggestExplainPrompt' },
  { labelKey: 'input.suggestExample', promptKey: 'input.suggestExamplePrompt' },
  { labelKey: 'input.suggestToCode', promptKey: 'input.suggestToCodePrompt' },
  { labelKey: 'input.suggestForDev', promptKey: 'input.suggestForDevPrompt' },
  { labelKey: 'input.suggestAdvanced', promptKey: 'input.suggestAdvancedPrompt' },
] as const;

// Staggered list container variants
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08
    }
  }
};

// Button items variants
const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 450, damping: 20 }
  }
};

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const direction = useDirection(message.content);
  const timeString = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const { t } = useTranslation();

  const handleSuggestionClick = (promptKey: string) => {
    const prompt = t(promptKey);
    const fullPrompt = `${prompt}\n\n${message.content}`;
    useChatStore.getState().sendMessage(fullPrompt);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex w-full justify-start group"
    >
      <div className="flex max-w-[95%] md:max-w-[85%] gap-4 items-start">
        {/* Avatar */}
        <div className="mt-1 relative">
          <Avatar isAI size="md" isThinking={message.isStreaming} />
          {message.isStreaming && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-[#090a0f]"></span>
            </span>
          )}
        </div>

        <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
          {/* Message Container */}
          <div
            dir={direction}
            className={cn(
              "px-5 py-4 rounded-2xl glass-card text-white text-sm md:text-base leading-relaxed break-words shadow-xl relative overflow-hidden markdown-content border border-white/[0.06] bg-white/[0.02]",
              direction === 'ltr' ? 'rounded-tl-sm' : 'rounded-tr-sm'
            )}
          >
            {/* Left border gradient indicator */}
            <div className={cn(
              "absolute inset-y-0 w-1 bg-gradient-to-b from-cyan-400/80 to-purple-500/80",
              direction === 'ltr' ? 'left-0' : 'right-0'
            )} />

            {message.isStreaming ? (
              <StreamingText content={message.content} />
            ) : (
              <FancyMarkdown content={message.content} />
            )}

            {/* Staggered Suggestion Buttons */}
            {!message.isStreaming && message.role === 'ASSISTANT' && (
              <motion.div 
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap gap-2"
              >
                {SUGGESTION_KEYS.map((item, idx) => (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -0.5 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSuggestionClick(item.promptKey)}
                    className="px-2.5 py-1.5 text-[11px] font-medium bg-white/[0.03] border border-white/[0.08] hover:bg-gradient-to-r hover:from-cyan-500/15 hover:to-purple-600/15 hover:border-cyan-500/25 text-white/60 hover:text-white rounded-lg transition-colors duration-150 cursor-pointer select-none"
                  >
                    {t(item.labelKey)}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer: Timestamp + Actions */}
          <div className="flex items-center gap-3 mt-1 px-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[10px] text-white/45 select-none">
              {timeString}
            </span>
            <MessageActions message={message} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
