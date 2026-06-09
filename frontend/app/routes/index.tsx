import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

export const Route = createFileRoute('/')({
  component: ChatInterface,
});

function ChatInterface() {
  const [input, setInput] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<string[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const chatSpaceRef = React.useRef<HTMLElement>(null);

  const hasText = input.trim().length > 0;

  const openMenu = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(true);
  };

  const toggleProfile = () => {
    setIsMenuOpen(false);
    setIsProfileOpen((prev) => !prev);
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const resizeInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '28px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 108)}px`;
    }
  };

  React.useEffect(() => {
    resizeInput();
  }, [input]);

  const sendMessage = () => {
    const value = input.trim();
    if (!value) return;
    setMessages((prev) => [...prev, value]);
    setInput('');
    setTimeout(() => {
      if (chatSpaceRef.current) {
        chatSpaceRef.current.scrollTop = chatSpaceRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePrimaryAction = () => {
    if (hasText) {
      sendMessage();
    } else {
      textareaRef.current?.focus();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="screen" aria-label="واجهة محادثة داكنة" dir="rtl">
      <header className="top-bar">
        <button
          className="circle-btn profile-btn"
          type="button"
          aria-label="الملف الشخصي"
          onClick={toggleProfile}
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M17.4 34.5c-4.5-1.9-7.5-5.9-7.5-10.5 0-6.7 6.3-12.1 14.1-12.1s14.1 5.4 14.1 12.1S31.8 36.1 24 36.1c-1.6 0-3.1-.2-4.5-.7l-6.2 2.2 1.4-5"
              strokeWidth="3.3"
              strokeDasharray="3.9 7.4"
            />
          </svg>
        </button>

        <button className="thinking-btn" type="button" aria-label="ChatHSM 3.1Pro">
          <span className="word">ChatHSM 3.1Pro</span>
        </button>

        <button
          className="circle-btn menu-btn"
          type="button"
          aria-label="القائمة"
          onClick={openMenu}
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <line x1="14" y1="19" x2="34" y2="19" strokeWidth="4" />
            <line x1="14" y1="29" x2="34" y2="29" strokeWidth="4" />
          </svg>
        </button>
      </header>

      <main className="chat-space" id="chatSpace" ref={chatSpaceRef} aria-live="polite">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
      </main>

      <nav className="quick-actions" aria-label="إجراءات سريعة">
        <button
          className="quick-action"
          type="button"
          onClick={() => handleQuickAction('أنشئ صورة')}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect x="5" y="5" width="22" height="22" rx="4" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M7 24l6.6-6.4 4.8 4.5 3.5-3.8 3.1 3.3" />
          </svg>
          <span>أنشئ صورة</span>
        </button>

        <button
          className="quick-action"
          type="button"
          onClick={() => handleQuickAction('الكتابة أو التحرير')}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M19.3 6.4l6.3 6.3" />
            <path d="M4.8 27.2l5.6-1.3L25.2 11a4.45 4.45 0 0 0-6.3-6.3L4.1 19.6z" />
          </svg>
          <span>الكتابة أو التحرير</span>
        </button>

        <button
          className="quick-action"
          type="button"
          onClick={() => handleQuickAction('ابحث عن شيء ما')}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="12" />
            <path d="M4 16h24" />
            <path d="M16 4c3.2 3.2 4.8 7.2 4.8 12S19.2 24.8 16 28" />
            <path d="M16 4c-3.2 3.2-4.8 7.2-4.8 12S12.8 24.8 16 28" />
          </svg>
          <span>ابحث عن شيء ما</span>
        </button>
      </nav>

      <section className="input-wrap" aria-label="صندوق الإدخال">
        <div className={`input-bar ${hasText ? 'has-text' : ''}`}>
          <button
            className="voice-btn"
            type="button"
            aria-label={hasText ? 'إرسال' : 'وضع الصوت'}
            onClick={handlePrimaryAction}
          >
            <span className="voice-wave" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </span>
            <svg className="send-arrow" viewBox="0 0 32 32" aria-hidden="true">
              <line x1="16" y1="25" x2="16" y2="7" />
              <polyline points="8 15 16 7 24 15" />
            </svg>
          </button>

          <button className="mic-btn" type="button" aria-label="الميكروفون">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <rect className="mic-fill" x="12" y="4" width="8" height="15" rx="4" />
              <path
                d="M7.5 15.5c0 5 3.8 9 8.5 9s8.5-4 8.5-9"
                strokeWidth="2.4"
              />
              <path d="M16 24.5V29" strokeWidth="2.4" />
            </svg>
          </button>

          <textarea
            className="chat-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="اطرح سؤالك على Ch..."
            aria-label="اكتب رسالتك"
          />

          <button className="plus-btn" type="button" aria-label="إضافة">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <line x1="16" y1="6" x2="16" y2="26" />
              <line x1="6" y1="16" x2="26" y2="16" />
            </svg>
          </button>
        </div>
      </section>

      {/* Overlays */}
      <div
        className={`overlay ${isMenuOpen || isProfileOpen ? 'active' : ''}`}
        onClick={closeAll}
      ></div>

      <aside className={`side-panel ${isMenuOpen ? 'open' : ''}`} aria-label="القائمة الجانبية">
        <div className="panel-head">
          <h2>القائمة</h2>
          <button className="panel-close" type="button" aria-label="إغلاق" onClick={closeAll}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="panel-list">
          <button className="panel-item" type="button">
            <svg viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v14" />
            </svg>
            <span>مشاركة</span>
          </button>
          <button className="panel-item" type="button">
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            <span>محادثة جديدة</span>
          </button>
          <button className="panel-item" type="button">
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
            <span>الأرشيف</span>
          </button>
          <button className="panel-item danger" type="button">
            <svg viewBox="0 0 24 24">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
            <span>حذف</span>
          </button>
        </div>
      </aside>

      <section
        className={`profile-sheet ${isProfileOpen ? 'open' : ''}`}
        aria-label="نافذة الملف الشخصي"
      >
        <div className="profile-title">الملف الشخصي</div>
        <p className="profile-subtitle">
          تم تجهيز الواجهة بنفس النمط الداكن الظاهر في الصورة مع زر Thinking وأزرار الإجراءات وصندوق الإدخال السفلي.
        </p>
      </section>
    </div>
  );
}
