import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  MessageSquare,
  Library,
  Settings,
  Sparkles,
  Languages,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { setAppLanguage, type AppLanguage } from "@/lib/i18n";
import { useChatStore } from "@/stores/chatStore";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, isMobile }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    loadConversations,
    deleteConversation,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const toggleLang = () => {
    const next: AppLanguage = i18n.language === "ar" ? "en" : "ar";
    setAppLanguage(next);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? 288 : (collapsed ? 76 : 288),
          x: isMobile ? (collapsed ? (i18n.language === "ar" ? 288 : -288) : 0) : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "relative z-50 flex h-screen shrink-0 flex-col glass-strong",
          isMobile && "fixed top-0 bottom-0",
          isMobile && i18n.language === "ar" ? "right-0" : "left-0"
        )}
      >
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img
            src="/brand/pwa-192.png"
            alt="ChatHSM"
            className="h-9 w-9 shrink-0 rounded-full object-cover shadow-lg"
          />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="overflow-hidden"
              >
                <div className="text-sm font-semibold leading-tight">
                  {t("app.name")}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {t("app.tagline")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="px-3">
        <Button
          onClick={() => createConversation()}
          className="w-full justify-start gap-2 rounded-xl border border-glass-border bg-glass text-foreground hover:bg-white/10"
          variant="ghost"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{t("sidebar.newChat")}</span>}
        </Button>
      </div>

      <div className="mt-3 px-3">
        <div className={cn(
          "flex items-center gap-2 rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm text-muted-foreground",
          collapsed && "justify-center px-0",
        )}>
          <Search className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("sidebar.search")}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          )}
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-2">
        {!collapsed && (
          <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("sidebar.recent")}
          </div>
        )}
        <ul className="space-y-1">
          {filteredConversations.map((chat) => (
            <li key={chat.id} className="relative group">
              <button
                onClick={() => setActiveConversation(chat.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  activeConversationId === chat.id
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  collapsed ? "justify-center px-0" : "pr-8",
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{chat.title}</span>}
              </button>

              {!collapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this conversation?")) {
                      deleteConversation(chat.id);
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-glass-border p-2">
        <SidebarItem icon={Library} label={t("sidebar.library")} collapsed={collapsed} />
        <SidebarItem
          icon={Languages}
          label={i18n.language === "ar" ? "English" : "العربية"}
          collapsed={collapsed}
          onClick={toggleLang}
        />
        <SidebarItem icon={Settings} label={t("sidebar.settings")} collapsed={collapsed} />
      </div>
    </motion.aside>
    </>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  collapsed,
  onClick,
}: {
  icon: typeof Settings;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
