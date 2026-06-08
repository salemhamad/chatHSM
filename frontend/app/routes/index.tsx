import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import { Settings, Menu, Plus, Mic, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/')({
  component: ChatInterface,
});

function ChatInterface() {
  const [input, setInput] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    console.log('Sending message:', input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background relative">
      {/* Background Decorators for Premium Dark Theme */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-10 h-96 w-96 rounded-full bg-blue-900/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-violet-900/10 blur-[120px]" />
      </div>

      {/* Top Navbar - Sticky & Non-glitchy */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 glass-panel border-b border-glass-border shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            ChatHSM
          </span>
        </div>
        <button
          className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {/* Messages Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="self-start glass-surface rounded-2xl rounded-tl-sm p-4 max-w-[85%] border border-glass-border">
              <p className="text-sm text-foreground">Hello! How can I assist you today?</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Dynamic Chat Input Module */}
      <footer className="shrink-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-8">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {/* External Attachment Button */}
          <button
            type="button"
            className="h-[52px] w-[52px] shrink-0 flex items-center justify-center rounded-2xl glass-surface border border-glass-border text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all shadow-sm"
            aria-label="Add attachment"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Input Container */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 relative rounded-3xl glass-surface border border-glass-border p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-end bg-black/40 backdrop-blur-2xl transition-all focus-within:border-blue-500/50 focus-within:bg-black/60"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none bg-transparent px-4 py-3.5 min-h-[52px] max-h-[200px] text-[15px] leading-relaxed text-foreground focus:outline-none placeholder:text-muted-foreground/60"
              placeholder="Message ChatHSM..."
              rows={1}
            />

            {/* Internal Controls */}
            <div className="flex items-center gap-1.5 shrink-0 px-2 pb-1.5">
              <button
                type="button"
                className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground/60 mt-4 mb-2">
          ChatHSM uses advanced AI. Please verify critical information.
        </p>
      </footer>
    </div>
  );
}
