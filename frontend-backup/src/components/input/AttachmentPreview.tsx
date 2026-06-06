import React from 'react';
import { X, File, Image as ImageIcon } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { formatFileSize } from '../../lib/utils';

export const AttachmentPreview: React.FC = () => {
  const { pendingAttachments, removePendingAttachment } = useChatStore();

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {pendingAttachments.map(att => (
        <div 
          key={att.id} 
          className="relative shrink-0 rounded-xl overflow-hidden glass-card group border border-white/10 min-w-[120px] max-w-[200px]"
        >
          <button
            onClick={() => removePendingAttachment(att.id)}
            className="absolute top-1 end-1 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <X className="w-3 h-3" />
          </button>

          {att.type === 'image' && att.preview ? (
            <div className="relative h-16 w-full">
              <img src={att.preview} alt="preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 h-16 bg-white/5">
              <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400 shrink-0">
                <File className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-white font-medium truncate">{att.file.name}</span>
                <span className="text-[10px] text-white/50">{formatFileSize(att.file.size)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
