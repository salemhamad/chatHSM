'use client';

import React, { useRef } from 'react';
import { Image, Camera, File, Mic, Globe } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useChatStore } from '../../stores/chatStore';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

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
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10 group-hover:bg-cyan-400/20'
    },
    {
      icon: Camera,
      label: t('input.camera'),
      onClick: () => {
        closeAttachmentMenu();
      },
      color: 'text-purple-400',
      bg: 'bg-purple-400/10 group-hover:bg-purple-400/20'
    },
    {
      icon: File,
      label: t('input.uploadFile'),
      onClick: () => fileInputRef.current?.click(),
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 group-hover:bg-emerald-400/20'
    },
    {
      icon: Mic,
      label: t('input.voiceInput'),
      onClick: () => {
        startRecording();
        closeAttachmentMenu();
      },
      color: 'text-rose-400',
      bg: 'bg-rose-400/10 group-hover:bg-rose-400/20',
      disabled: !voiceSupported
    },
    {
      icon: Globe,
      label: t('input.webSearch'),
      onClick: () => {
        toggleWebSearch();
      },
      color: webSearchEnabled ? 'text-cyan-400' : 'text-white/40',
      bg: webSearchEnabled ? 'bg-cyan-400/20' : 'bg-white/5 group-hover:bg-white/10',
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
      
      {/* Invisible overlay for click-away */}
      <div className="fixed inset-0 z-40" onClick={closeAttachmentMenu} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring' as const, stiffness: 450, damping: 25 }}
        className="absolute bottom-[calc(100%+12px)] start-0 z-50 min-w-[210px] bg-[#0c0d12]/95 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl border border-white/[0.08]"
      >
        <div className="flex flex-col gap-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.disabled) return null;
            
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.015, x: 2 }}
                whileTap={{ scale: 0.985 }}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-xl text-sm transition-colors group cursor-pointer",
                  "hover:bg-white/[0.04] text-white/80 hover:text-white"
                )}
              >
                <div className={cn("p-2 rounded-lg transition-colors", item.bg)}>
                  <Icon className={cn("w-4 h-4", item.color)} />
                </div>
                <span className="font-semibold flex-1 text-start text-xs">{item.label}</span>
                {item.toggle && (
                  <div className={cn(
                    "w-8 h-4.5 rounded-full transition-colors relative border border-white/5",
                    item.active ? "bg-cyan-500" : "bg-white/10"
                  )}>
                    <motion.div 
                      animate={{ x: item.active ? 16 : 2 }}
                      transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                      className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm" 
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};
