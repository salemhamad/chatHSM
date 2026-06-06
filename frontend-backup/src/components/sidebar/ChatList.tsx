'use client';

import React, { useEffect, useMemo } from 'react';
import { MessageSquare, Pin, Trash2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn, groupConversationsByDate } from '../../lib/utils';
import { Tooltip } from '../ui/Tooltip';

interface ChatListProps {
  collapsed?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({ collapsed = false }) => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    loadConversations, 
    searchQuery, 
    deleteConversation 
  } = useChatStore();
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
    if (collapsed) return null;
    return (
      <div className="px-4 text-center text-xs text-white/30 mt-8 leading-relaxed">
        {t('sidebar.emptyChats')}
      </div>
    );
  }

  if (searchQuery && filteredConversations.length === 0) {
    if (collapsed) return null;
    return (
      <div className="px-4 text-center text-xs text-white/30 mt-8 leading-relaxed">
        {t('sidebar.emptyChats')}
      </div>
    );
  }

  return (
    <div className={cn("px-3 space-y-5", collapsed && "px-1 space-y-3")}>
      {Object.entries(groups).map(([groupName, groupConvs]) => {
        if (groupConvs.length === 0) return null;
        
        return (
          <div key={groupName} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 mb-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {getGroupLabel(groupName)}
              </h3>
            )}
            <ul className="space-y-1">
              {groupConvs.map(conv => {
                const isActive = activeConversationId === conv.id;
                
                const itemButton = (
                  <button
                    onClick={() => setActiveConversation(conv.id)}
                    className={cn(
                      'w-full text-start flex items-center rounded-xl text-xs transition-all relative border',
                      collapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'gap-2.5 px-3 py-2.5',
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/25 text-cyan-300 font-semibold shadow-sm' 
                        : 'bg-transparent border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white'
                    )}
                  >
                    <MessageSquare 
                      className={cn(
                        'w-3.5 h-3.5 shrink-0', 
                        isActive ? 'text-cyan-400' : 'text-white/40 group-hover:text-white/60'
                      )} 
                    />
                    
                    {!collapsed && (
                      <>
                        <div className="flex-1 truncate pr-1">
                          {conv.title}
                        </div>

                        {conv.isPinned && (
                          <Pin className="w-3 h-3 text-cyan-400/80 shrink-0" />
                        )}

                        {/* Hover action menu */}
                        <div className="hidden group-hover:flex items-center gap-1 absolute end-2 bg-gradient-to-l from-[#0e0f13] via-[#0e0f13] to-transparent pl-4 pr-1">
                          <Tooltip content={t('actions.delete')} position="top">
                            <div 
                              className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-white/40 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </div>
                          </Tooltip>
                        </div>
                      </>
                    )}
                  </button>
                );

                return (
                  <li key={conv.id} className="group">
                    {collapsed ? (
                      <Tooltip content={conv.title} position="right">
                        {itemButton}
                      </Tooltip>
                    ) : (
                      itemButton
                    )}
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
