import React from 'react';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useDirection } from '../../hooks/useDirection';
import { MessageActions } from './MessageActions';
import { StreamingText } from './StreamingText';
import { cn } from '../../lib/utils';

import { Markdown } from '../ui/Markdown';

interface AIMessageProps {
  message: Message;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const direction = useDirection(message.content);
  const timeString = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                "px-5 py-4 rounded-2xl glass-card text-white text-sm md:text-base leading-relaxed break-words shadow-sm relative overflow-hidden",
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
                <Markdown content={message.content} />
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
