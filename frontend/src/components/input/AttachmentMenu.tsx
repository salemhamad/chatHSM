import React, { useRef } from 'react';
import { Image, Camera, File, Mic, Globe } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';

export const AttachmentMenu: React.FC = () => {
  const { toggleWebSearch, webSearchEnabled, closeAttachmentMenu } = useUIStore();
  const { addPendingAttachment } = useChatStore();
  const { startRecording, isSupported: voiceSupported } = useVoiceRecorder();
  const { t } = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => addPendingAttachment(file));
    }
    closeAttachmentMenu();
  };

  const menuItems = [
    {
      icon: Image,
      label: t('input.uploadImage'),
      onClick: () => imageInputRef.current?.click(),
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 group-hover:bg-blue-400/20'
    },
    {
      icon: Camera,
      label: t('input.camera'),
      onClick: () => {
        closeAttachmentMenu();
      },
      color: 'text-pink-400',
      bg: 'bg-pink-400/10 group-hover:bg-pink-400/20'
    },
    {
      icon: File,
      label: t('input.uploadFile'),
      onClick: () => fileInputRef.current?.click(),
      color: 'text-green-400',
      bg: 'bg-green-400/10 group-hover:bg-green-400/20'
    },
    {
      icon: Mic,
      label: t('input.voiceInput'),
      onClick: () => {
        startRecording();
        closeAttachmentMenu();
      },
      color: 'text-red-400',
      bg: 'bg-red-400/10 group-hover:bg-red-400/20',
      disabled: !voiceSupported
    },
    {
      icon: Globe,
      label: t('input.webSearch'),
      onClick: () => {
        toggleWebSearch();
      },
      color: webSearchEnabled ? 'text-brand-400' : 'text-gray-400',
      bg: webSearchEnabled ? 'bg-brand-400/20' : 'bg-gray-400/10 group-hover:bg-gray-400/20',
      toggle: true,
      active: webSearchEnabled
    }
  ];

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple 
      />
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
        multiple 
      />
      
      {/* Invisible overlay to close menu on outside click */}
      <div className="fixed inset-0 z-40" onClick={closeAttachmentMenu} />
      
      <div className="absolute bottom-[calc(100%+12px)] start-0 z-50 min-w-[200px] glass-panel rounded-2xl p-2 animate-slideUp origin-bottom-left shadow-2xl border border-white/10">
        <div className="flex flex-col gap-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.disabled) return null;
            
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-xl text-sm transition-all group",
                  "hover:bg-white/10 text-white/80 hover:text-white"
                )}
              >
                <div className={cn("p-2 rounded-lg transition-colors", item.bg)}>
                  <Icon className={cn("w-4 h-4", item.color)} />
                </div>
                <span className="font-medium flex-1 text-start">{item.label}</span>
                {item.toggle && (
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    item.active ? "bg-brand-500" : "bg-white/20"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                      item.active ? "start-[18px]" : "start-0.5"
                    )} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
