'use client';

import React from 'react';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useDirection } from '../../hooks/useDirection';
import { cn } from '../../lib/utils';
import { File } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const direction = useDirection(message.content);
  const timeString = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex w-full justify-end"
    >
      <div className="flex max-w-[85%] md:max-w-[75%] gap-3 items-end">
        <div className="flex flex-col items-end gap-1 min-w-0">
          
          {/* Attachments list */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 mb-1.5">
              {message.attachments.map(att => (
                <motion.div 
                  key={att.id} 
                  whileHover={{ scale: 1.02, translateY: -1 }}
                  className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-md p-1 max-w-[200px] shadow-lg shadow-black/10"
                >
                  {att.fileType.startsWith('image/') && att.url ? (
                    <img src={att.url} alt={att.fileName} className="w-full h-auto rounded-lg object-cover max-h-48 select-none" />
                  ) : (
                    <div className="flex items-center gap-2.5 p-2.5">
                      <File className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-white/90 truncate">{att.fileName}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Message Text Bubble */}
          <div 
            dir={direction}
            className={cn(
              "px-5 py-3 rounded-2xl text-white shadow-xl text-sm md:text-base leading-relaxed break-words border border-white/10",
              "bg-gradient-to-br from-cyan-600/90 to-blue-600/90 backdrop-blur-md",
              direction === 'ltr' ? 'rounded-br-sm' : 'rounded-bl-sm'
            )}
          >
            {message.content}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-white/40 px-1 select-none">
            {timeString}
          </span>
        </div>

        {/* User Avatar */}
        <Avatar size="sm" className="mb-4" />
      </div>
    </motion.div>
  );
};
