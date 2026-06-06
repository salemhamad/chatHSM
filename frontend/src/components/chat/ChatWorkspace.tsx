import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { AuroraBackground } from "./AuroraBackground";
import { useChatStore } from "@/stores/chatStore";

const suggestionKeys = [
  "chat.suggestions.one",
  "chat.suggestions.two",
  "chat.suggestions.three",
  "chat.suggestions.four",
] as const;

export function ChatWorkspace() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");

  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    activeConversationId,
    sendMessage,
    loadMessages,
  } = useChatStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Auto scroll to bottom when new messages or streaming text changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isStreaming]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    sendMessage(content);
  };

  const empty = messages.length === 0 && !isStreaming;

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-foreground">
      <AuroraBackground />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
            <span>Online</span>
          </div>
        </header>

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-8">
            <div className="mx-auto w-full max-w-3xl py-6">
              {isLoading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {empty ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
                    >
                      <div
                        className="mb-6 grid h-16 w-16 place-items-center rounded-3xl shadow-[var(--shadow-elevated)]"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        <Sparkles className="h-7 w-7 text-primary-foreground" strokeWidth={2.2} />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        <span className="gradient-text">{t("chat.greeting")}</span>
                      </h1>
                      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                        {t("chat.subtitle")}
                      </p>
                      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                        {suggestionKeys.map((key, i) => (
                          <motion.button
                            key={key}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                            whileHover={{ y: -2 }}
                            onClick={() => send(t(key))}
                            className="glass-panel rounded-2xl px-4 py-3.5 text-start text-sm text-foreground/90 transition-colors hover:bg-white/10"
                          >
                            {t(key)}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="thread"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-6 pb-4"
                    >
                      {messages.map((m, i) => (
                        <MessageBubble key={m.id} message={m} index={i} />
                      ))}
                      
                      {isStreaming && streamingContent && (
                        <MessageBubble
                          message={{
                            id: "streaming",
                            role: "ASSISTANT",
                            content: streamingContent,
                            isStreaming: true,
                            conversationId: activeConversationId || "",
                            userId: "assistant",
                            attachments: [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          }}
                          index={messages.length}
                        />
                      )}

                      {isStreaming && !streamingContent && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="inline-flex gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                          </span>
                          {t("chat.thinking")}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>

          <div className="px-4 pb-6 pt-2 sm:px-8">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => send()}
              disabled={isStreaming}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
