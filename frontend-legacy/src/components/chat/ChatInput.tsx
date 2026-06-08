import { useRef, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowUp, Paperclip, Mic, X, File } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatFileSize } from "@/lib/utils";
import { useChatStore } from "@/stores/chatStore";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    pendingAttachments,
    addPendingAttachment,
    removePendingAttachment,
  } = useChatStore();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value, pendingAttachments]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || pendingAttachments.length > 0) onSubmit();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach((file) => {
      addPendingAttachment(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasAttachments = pendingAttachments.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-3xl"
    >
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      <div className="glass-strong rounded-3xl p-2 shadow-[var(--shadow-elevated)] transition-all focus-within:ring-2 focus-within:ring-primary/40">
        {/* Attachment Previews */}
        <AnimatePresence>
          {hasAttachments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 px-3 pb-3 pt-1 border-b border-white/5 overflow-hidden"
            >
              {pendingAttachments.map((att) => (
                <motion.div
                  key={att.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 pr-8 group max-w-xs"
                >
                  {att.type === "image" && att.preview ? (
                    <img
                      src={att.preview}
                      alt="Attachment Preview"
                      className="h-9 w-9 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center bg-white/10 rounded-lg shrink-0">
                      <File className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground leading-tight">
                      {att.file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatFileSize(att.file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(att.id)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileClick}
            className="h-10 w-10 shrink-0 rounded-2xl text-muted-foreground hover:bg-white/10 hover:text-foreground"
            type="button"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </Button>
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t("chat.placeholder")}
            rows={1}
            className="flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-2xl text-muted-foreground hover:bg-white/10 hover:text-foreground"
            type="button"
          >
            <Mic className="h-4.5 w-4.5" />
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={disabled || (!value.trim() && !hasAttachments)}
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-2xl text-primary-foreground shadow-lg transition-all",
              "disabled:opacity-40",
            )}
            style={{ background: "var(--gradient-primary)" }}
          >
            <ArrowUp className="h-4.5 w-4.5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        ChatHSM can make mistakes. Verify important information.
      </p>
    </motion.div>
  );
}
