'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Send, Plus, Loader2, AlertCircle, Mic } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { usePrefetchStore } from '../../stores/prefetchStore';
import { useTranslation } from '../../hooks/useTranslation';
import { usePrefetch } from '../../hooks/usePrefetch';
import { AttachmentMenu } from './AttachmentMenu';
import { AttachmentPreview } from './AttachmentPreview';
import { PrefetchIndicator } from './PrefetchIndicator';
import { VoiceRecorder } from './VoiceRecorder';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, pendingAttachments, activeConversationId } = useChatStore();
  const { attachmentMenuOpen, toggleAttachmentMenu, isRecording } = useUIStore();
  const { startRecording } = useVoiceRecorder();
  const { t } = useTranslation();

  const { onDraftChange, cancelPrefetch, status: prefetchStatus } = usePrefetch(activeConversationId);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onDraftChange(newValue);
  };

  const handleSend = async () => {
    if (!content.trim() && pendingAttachments.length === 0) return;
    if (isStreaming) return;

    setError(null);
    const textToSend = content;
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const prefetchResult = usePrefetchStore.getState().consumeResult();
    cancelPrefetch();

    try {
      const sendOptions: {
        webSearch?: boolean;
        prefetchContext?: string;
        prefetchRequestId?: string;
      } = {};

      if (prefetchResult && prefetchResult.context) {
        sendOptions.prefetchContext = prefetchResult.context;
        sendOptions.prefetchRequestId = prefetchResult.requestId;
      }

      await sendMessage(textToSend, sendOptions);
    } catch (err) {
      setError(t('input.errorSend'));
      setContent(textToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    if (error && content) {
      handleSend();
    }
  };

  const showSend = content.trim().length > 0 || pendingAttachments.length > 0;

  return (
    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#050508] via-[#050508]/90 to-transparent pt-16 pb-6 px-4 md:px-8 pointer-events-none z-20">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto relative">

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute -top-12 inset-x-0 flex justify-center"
            >
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-200 px-4 py-2 rounded-xl text-sm flex items-center gap-3 shadow-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{error}</span>
                <button
                  onClick={handleRetry}
                  className="text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  {t('input.retry')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Previews */}
        {pendingAttachments.length > 0 && (
          <div className="mb-2">
            <AttachmentPreview />
          </div>
        )}

        {/* Voice Recorder Overlay */}
        {isRecording && <VoiceRecorder onResult={(text) => setContent(prev => prev + (prev ? ' ' : '') + text)} />}

        {/* Lit glass boundary frame (shadcn/ui premium style) */}
        <div className={cn(
          "w-full rounded-[24px] p-[1px] transition-all duration-500 shadow-2xl shadow-black/60",
          "bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.04]",
          showSend && "shadow-[0_0_30px_rgba(6,182,212,0.06)]"
        )}>

          {/* Inner card container */}
          <div className="w-full min-h-[80px] bg-[#0c0d12]/90 backdrop-blur-3xl rounded-[23px] flex items-end gap-3 px-4 py-3">

            {/* Attachment Menu Trigger */}
            <div className="relative shrink-0 mb-1">
              <button
                onClick={toggleAttachmentMenu}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer",
                  attachmentMenuOpen ? "bg-cyan-500/15 text-cyan-400" : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/50 hover:text-white"
                )}
              >
                <Plus className={cn("w-5 h-5 transition-transform duration-200", attachmentMenuOpen && "rotate-45")} />
              </button>
              
              <AnimatePresence>
                {attachmentMenuOpen && <AttachmentMenu />}
              </AnimatePresence>
            </div>

            {/* Input textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              dir="auto"
              placeholder={t('input.placeholder')}
              className="flex-1 bg-transparent border-none outline-none text-white text-sm md:text-base resize-none max-h-[180px] py-2 leading-relaxed placeholder-white/20 no-scrollbar mb-1"
              rows={1}
              disabled={isStreaming || isRecording}
            />

            {/* Dynamic Button Area (Voice / Send toggle) */}
            <div className="relative w-11 h-11 shrink-0 mb-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {showSend ? (
                  <motion.button
                    key="send-btn"
                    initial={{ scale: 0.85, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.85, rotate: -30, opacity: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 22 }}
                    onClick={handleSend}
                    disabled={isStreaming || isRecording}
                    className="absolute inset-0 rounded-xl text-black flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
                    title={t('input.send')}
                  >
                    {isStreaming ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : (
                      <Send className="w-5 h-5 rtl:-scale-x-100 text-black" />
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    key="mic-btn"
                    initial={{ scale: 0.85, rotate: 30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.85, rotate: 30, opacity: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 22 }}
                    onClick={startRecording}
                    disabled={isStreaming || isRecording}
                    className="absolute inset-0 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] text-white/50 hover:text-white flex items-center justify-center active:scale-95 cursor-pointer"
                    title={t('input.voiceInput')}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Footer row: Prefetch indicator & Disclaimer */}
        <div className="flex items-center justify-between mt-2 px-1 select-none">
          <PrefetchIndicator status={prefetchStatus} />
          <div className="text-[10px] text-white/20">
            {t('input.disclaimer')}
          </div>
        </div>
      </div>
    </div>
  );
};
