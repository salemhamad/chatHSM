import React from 'react';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useDirection } from '../../hooks/useDirection';
import { cn } from '../../lib/utils';
import { File, Image as ImageIcon } from 'lucide-react';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const direction = useDirection(message.content);
  
  const timeString = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex w-full justify-end animate-slideUp">
      <div className="flex max-w-[85%] md:max-w-[75%] gap-3 items-end">
        <div className="flex flex-col items-end gap-1 min-w-0">
          
          {/* Attachments (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 mb-1">
              {message.attachments.map(att => (
                <div key={att.id} className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5 p-1 max-w-[200px]">
                  {att.fileType.startsWith('image/') && att.url ? (
                    <img src={att.url} alt={att.fileName} className="w-full h-auto rounded object-cover max-h-48" />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <File className="w-4 h-4 text-brand-400" />
                      <span className="text-xs text-white truncate">{att.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Bubble */}
          <div 
            dir={direction}
            className={cn(
              "px-5 py-3 rounded-2xl bg-gradient-to-br from-brand-600 to-blue-600 text-white shadow-md border border-white/10 text-sm md:text-base leading-relaxed break-words",
              // Rounded corners based on RTL/LTR
              direction === 'ltr' ? 'rounded-br-sm' : 'rounded-bl-sm'
            )}
          >
            {message.content}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-white/40 px-1">
            {timeString}
          </span>
        </div>

        {/* Avatar */}
        <Avatar size="sm" />
      </div>
    </div>
  );
};
