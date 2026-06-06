import React, { useState } from 'react';
import { Pin, ChevronDown, ChevronRight } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { formatRelativeTime } from '../../lib/utils';

export const PinnedMessages: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { messages, setActiveConversation } = useChatStore();
  const { t } = useTranslation();

  const pinnedMessages = messages.filter(m => m.isPinned);

  if (pinnedMessages.length === 0) return null;

  return (
    <div className="px-3">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 mb-2 text-xs font-semibold text-brand-400 uppercase tracking-wider hover:text-brand-300 transition-colors"
      >
        <Pin className="w-3 h-3" />
        <span className="flex-1 text-start">{t('sidebar.pinnedMessages')}</span>
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {isExpanded && (
        <ul className="space-y-1">
          {pinnedMessages.map(msg => (
            <li key={msg.id}>
              <button
                onClick={() => setActiveConversation(msg.conversationId)}
                className="w-full text-start p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 transition-all group"
              >
                <div className="text-xs text-brand-300 mb-1 flex justify-between items-center">
                  <span className="truncate pe-2">
                    {msg.role === 'USER' ? t('common.you') : t('common.ai')}
                  </span>
                  <span className="shrink-0 text-[10px] opacity-70">
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-white/90 line-clamp-2">
                  {msg.content}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
