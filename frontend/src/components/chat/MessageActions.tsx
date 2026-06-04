import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, Volume2, VolumeX, Pin, Square } from 'lucide-react';
import { Message } from '../../types';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../lib/utils';

interface MessageActionsProps {
  message: Message;
}

export const MessageActions: React.FC<MessageActionsProps> = ({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { pinMessage, stopGenerating, retryMessage } = useChatStore();
  const { t, activeLanguage } = useTranslation();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content);
      // Auto-detect language using the active translation language
      utterance.lang = activeLanguage === 'en' ? 'en-US' : (activeLanguage === 'ar' ? 'ar-SA' : activeLanguage);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup speech on unmount
      if (isPlaying) window.speechSynthesis.cancel();
    };
  }, [isPlaying]);

  const ActionButton = ({ icon: Icon, onClick, tooltip, active = false }: any) => (
    <Tooltip content={tooltip}>
      <button 
        onClick={onClick}
        className={cn(
          "p-1.5 rounded-md transition-all",
          active 
            ? "bg-brand-500/20 text-brand-300" 
            : "text-white/40 hover:text-white/90 hover:bg-white/10"
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </button>
    </Tooltip>
  );

  if (message.isStreaming) {
    return (
      <ActionButton 
        icon={Square} 
        onClick={stopGenerating} 
        tooltip={t('actions.stopStreaming')} 
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <ActionButton 
        icon={isCopied ? Check : Copy} 
        onClick={handleCopy} 
        tooltip={isCopied ? t('actions.copied') : t('actions.copy')} 
      />
      
      <ActionButton 
        icon={RefreshCw} 
        onClick={() => retryMessage(message.content)} 
        tooltip={t('actions.regenerate')} 
      />
      
      <ActionButton 
        icon={isPlaying ? VolumeX : Volume2} 
        onClick={handleSpeak} 
        tooltip={isPlaying ? t('actions.stopReadAloud') : t('actions.readAloud')} 
        active={isPlaying}
      />
      
      <ActionButton 
        icon={Pin} 
        onClick={() => pinMessage(message.id)} 
        tooltip={message.isPinned ? t('actions.unpin') : t('actions.pin')} 
        active={message.isPinned}
      />
    </div>
  );
};
