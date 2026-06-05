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

interface AIMessageProps {
  message: Message;
}

// Suggestion button configuration using i18n keys
const SUGGESTION_KEYS = [
  { labelKey: 'input.suggestSummarize', promptKey: 'input.suggestSummarizePrompt' },
  { labelKey: 'input.suggestExplain', promptKey: 'input.suggestExplainPrompt' },
  { labelKey: 'input.suggestExample', promptKey: 'input.suggestExamplePrompt' },
  { labelKey: 'input.suggestToCode', promptKey: 'input.suggestToCodePrompt' },
  { labelKey: 'input.suggestForDev', promptKey: 'input.suggestForDevPrompt' },
  { labelKey: 'input.suggestAdvanced', promptKey: 'input.suggestAdvancedPrompt' },
] as const;

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
    <div className="flex w-full justify-start animate-fadeIn group">
      <div className="flex max-w-[95%] md:max-w-[85%] gap-4 items-start">
          {/* Avatar */}
          <div className="mt-1 relative">
            <Avatar isAI size="md" />
            {message.isStreaming && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-black"></span>
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
            {/* Message Container */}
            <div
              dir={direction}
              className={cn(
                "px-5 py-4 rounded-2xl glass-card text-white text-sm md:text-base leading-relaxed break-words shadow-sm relative overflow-hidden markdown-content",
                direction === 'ltr' ? 'rounded-tl-sm' : 'rounded-tr-sm'
              )}
            >
              {/* Subtle left border gradient indicator */}
              <div className={cn(
                "absolute inset-y-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500",
                direction === 'ltr' ? 'left-0' : 'right-0'
              )} />

              {message.isStreaming ? (
                <StreamingText content={message.content} />
              ) : (
                <FancyMarkdown content={message.content} />
              )}

              {/* Suggestion Buttons - only show for completed messages */}
              {!message.isStreaming && message.role === 'ASSISTANT' && (
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {SUGGESTION_KEYS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item.promptKey)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white/[0.04] border border-white/10 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-600/20 hover:border-cyan-500/30 text-white/70 hover:text-white rounded-lg transition-all duration-200 active:scale-95"
                    >
                      {t(item.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>

          {/* Footer: Timestamp + Actions */}
          <div className="flex items-center gap-3 mt-1 px-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/40">
              {timeString}
            </span>
            <MessageActions message={message} />
          </div>
        </div>
      </div>
    </div>
  );
};
