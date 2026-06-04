import React, { useEffect, useMemo } from 'react';
import { MessageSquare, Pin, Trash2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn, groupConversationsByDate } from '../../lib/utils';
import { Tooltip } from '../ui/Tooltip';

export const ChatList: React.FC = () => {
  const { conversations, activeConversationId, setActiveConversation, loadConversations, searchQuery, deleteConversation } = useChatStore();
  const { t } = useTranslation();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const groups = useMemo(() => groupConversationsByDate(filteredConversations), [filteredConversations]);

  const getGroupLabel = (groupName: string): string => {
    switch (groupName) {
      case 'Today':
        return t('sidebar.groupToday');
      case 'Yesterday':
        return t('sidebar.groupYesterday');
      case 'Previous 7 Days':
        return t('sidebar.group7Days');
      case 'Older':
        return t('sidebar.groupOlder');
      default:
        return groupName;
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="px-4 text-center text-sm text-white/40 mt-8">
        {t('sidebar.emptyChats')}
      </div>
    );
  }

  if (searchQuery && filteredConversations.length === 0) {
    return (
      <div className="px-4 text-center text-sm text-white/40 mt-8">
        {t('sidebar.emptyChats')}
      </div>
    );
  }

  return (
    <div className="px-3 space-y-6">
      {Object.entries(groups).map(([groupName, groupConvs]) => {
        if (groupConvs.length === 0) return null;
        
        return (
          <div key={groupName}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              {getGroupLabel(groupName)}
            </h3>
            <ul className="space-y-1">
              {groupConvs.map(conv => {
                const isActive = activeConversationId === conv.id;
                return (
                  <li key={conv.id}>
                    <button
                      onClick={() => setActiveConversation(conv.id)}
                      className={cn(
                        'w-full text-start flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative',
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 font-medium shadow-sm border border-cyan-500/20' 
                          : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      <MessageSquare className={cn('w-4 h-4 shrink-0', isActive ? 'text-cyan-400' : 'text-white/40 group-hover:text-white/60')} />
                      
                      <div className="flex-1 truncate">
                        {conv.title}
                      </div>

                      {conv.isPinned && (
                        <Pin className="w-3 h-3 text-cyan-400 shrink-0" />
                      )}

                      {/* Action menu on hover */}
                      <div className="hidden group-hover:flex items-center gap-1 absolute end-2 rtl:start-2 bg-gradient-to-l from-[#0D0F12] via-[#0D0F12] to-transparent ps-4 pe-1">
                        <Tooltip content={t('actions.delete')}>
                          <div 
                            className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-white/40"
                            onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </div>
                        </Tooltip>
                      </div>

                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
