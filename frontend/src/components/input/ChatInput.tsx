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

export const ChatInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, pendingAttachments, activeConversationId } = useChatStore();
  const { attachmentMenuOpen, toggleAttachmentMenu, isRecording } = useUIStore();
  const { startRecording } = useVoiceRecorder();
  const { t } = useTranslation();

  // Predictive pre-fetching integration
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
    // Notify the prefetch hook of the draft change
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

    // Attempt to consume any ready prefetch result
    const prefetchResult = usePrefetchStore.getState().consumeResult();
    // Cancel any in-flight prefetch
    cancelPrefetch();

    try {
      // Merge prefetch context into the send request
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
    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/90 to-transparent pt-12 pb-6 px-4 md:px-8 pointer-events-none z-20">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto relative">

        {/* Error State */}
        {error && (
          <div className="absolute -top-12 inset-x-0 flex justify-center animate-fadeIn">
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-200 px-4 py-2 rounded-xl text-sm flex items-center gap-3 shadow-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
              >
                {t('input.retry')}
              </button>
            </div>
          </div>
        )}

        {/* Attachment Previews */}
        {pendingAttachments.length > 0 && (
          <div className="mb-2">
            <AttachmentPreview />
          </div>
        )}

        {/* Voice Recorder Overlay */}
        {isRecording && <VoiceRecorder onResult={(text) => setContent(prev => prev + (prev ? ' ' : '') + text)} />}

        {/* RGB glow boundary frame */}
        <div className={cn(
          "w-full rounded-3xl p-[2px] animate-rgb-glow shadow-[0_0_20px_rgba(0,255,213,0.15)]",
          showSend && "active-glow"
        )}>

          {/* Inner container */}
          <div className="w-full min-h-[93px] bg-[#161922] rounded-[22px] flex items-end gap-3 px-4 py-3 box-border">

            {/* Attachment (+) menu toggle button */}
            <div className="relative shrink-0 mb-1">
              <button
                onClick={toggleAttachmentMenu}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300 flex items-center justify-center group",
                  attachmentMenuOpen ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-400 group-hover:text-cyan-400"
                )}
              >
                <Plus className={cn("w-5 h-5 transition-transform duration-300", attachmentMenuOpen && "rotate-45")} />
              </button>
              {attachmentMenuOpen && <AttachmentMenu />}
            </div>

            {/* Input textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              dir="auto"
              placeholder={t('input.placeholder')}
              className="flex-1 bg-transparent border-none outline-none text-white text-base resize-none max-h-[180px] py-2 leading-relaxed font-medium placeholder-gray-500 no-scrollbar mb-1"
              rows={1}
              disabled={isStreaming || isRecording}
            />

            {/* Dynamic buttons (voice recorder / send) */}
            <div className="relative w-11 h-11 shrink-0 mb-1 flex items-center justify-center">
              {/* Voice input button */}
              <button
                onClick={startRecording}
                disabled={isStreaming || isRecording}
                className={cn(
                  "absolute inset-0 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition-all duration-300 transform active:scale-95",
                  showSend ? "opacity-0 scale-75 pointer-events-none rotate-90" : "opacity-100 scale-100 rotate-0"
                )}
                title={t('input.voiceInput')}
              >
                <Mic className="w-5 h-5 text-gray-400" />
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={isStreaming || isRecording}
                className={cn(
                  "absolute inset-0 rounded-xl text-black flex items-center justify-center transition-all duration-300 transform active:scale-95",
                  showSend
                    ? "opacity-100 scale-100 rotate-0 bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                    : "opacity-0 scale-75 pointer-events-none -rotate-90 bg-gray-800"
                )}
                title={t('input.send')}
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                ) : (
                  <Send className="w-5 h-5 rtl:-scale-x-100 text-black" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Footer row: Prefetch indicator + Disclaimer */}
        <div className="flex items-center justify-between mt-2 px-1">
          <PrefetchIndicator status={prefetchStatus} />
          <div className="text-[10px] text-white/20">
            {t('input.disclaimer')}
          </div>
        </div>
      </div>
    </div>
  );
};
