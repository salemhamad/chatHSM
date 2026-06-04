'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  User,
  Globe,
  Palette,
  Info,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  Calendar,
  ChevronRight,
  Shield,
  LogOut,
  Download,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../hooks/useTranslation';
import { removeToken } from '../../lib/api';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabId;
}

type TabId = 'account' | 'language' | 'appearance' | 'about';

interface Tab {
  id: TabId;
  key: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'account', key: 'settings.accountTab', icon: <User className="w-4 h-4" /> },
  { id: 'language', key: 'settings.languageTab', icon: <Globe className="w-4 h-4" /> },
  { id: 'appearance', key: 'settings.appearanceTab', icon: <Palette className="w-4 h-4" /> },
  { id: 'about', key: 'settings.aboutTab', icon: <Info className="w-4 h-4" /> },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, initialTab = 'account' }) => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const { profile, isLoading, error, successMessage, fetchProfile, updateProfile, clearMessages } = useUserStore();
  const { t, language, direction, changeLanguage, languagesList } = useTranslation();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Reset to initial tab whenever panel opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchProfile();
      clearMessages();
    }
  }, [isOpen, initialTab, fetchProfile, clearMessages]);

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
    }
  }, [profile]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSaveProfile = useCallback(async () => {
    const success = await updateProfile({ displayName: displayName.trim() || undefined });
    if (success) {
      // Profile saved
    }
  }, [displayName, updateProfile]);

  const handleLanguageChange = useCallback((lang: string) => {
    changeLanguage(lang);
  }, [changeLanguage]);

  const handleLogout = useCallback(() => {
    removeToken();
    localStorage.removeItem('guest_id');
    localStorage.removeItem('ai-chat-storage');
    localStorage.removeItem('user-profile-storage');
    localStorage.removeItem('chathsm-lang');
    window.location.reload();
  }, []);

  const handleExportData = useCallback(() => {
    const data = {
      profile,
      exportedAt: new Date().toISOString(),
      conversations: JSON.parse(localStorage.getItem('ai-chat-storage') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chathsm-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [profile]);

  if (!isOpen) return null;

  const tokenPercent = profile ? Math.min(100, Math.round((profile.dailyTokensUsed / profile.dailyTokensLimit) * 100)) : 0;
  const usernameInitial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] animate-fadeIn"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 animate-fadeIn">
        <div
          className="w-full max-w-[680px] h-[580px] max-h-[85vh] bg-[#0e0f13]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('settings.title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content with Tab Navigation */}
          <div className="flex flex-1 min-h-0">
            {/* Tab Sidebar */}
            <nav className="w-[180px] shrink-0 border-e border-white/[0.04] bg-white/[0.01] py-3 px-2 flex flex-col gap-1 overflow-y-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); clearMessages(); }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-start',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-500/5'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                  )}
                >
                  {tab.icon}
                  <span>{t(tab.key)}</span>
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              {/* Status messages */}
              {(error || successMessage) && (
                <div className={cn(
                  'mb-4 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-slideUp',
                  error
                    ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                )}>
                  {error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                  <span>{error ? t('settings.errorSaveProfile') : t('settings.successSaveProfile')}</span>
                </div>
              )}

              {/* ═══════════════ ACCOUNT TAB ═══════════════ */}
              {activeTab === 'account' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Profile Section */}
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                      {t('settings.profileTitle')}
                    </h3>

                    {/* Avatar & Name */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-2xl font-bold text-white/80 shrink-0 shadow-lg shadow-cyan-500/10">
                        {usernameInitial}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-white font-semibold text-base truncate">{displayName || t('settings.guestUser')}</p>
                        <p className="text-white/40 text-sm flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{profile?.email || '—'}</span>
                        </p>
                        {profile?.createdAt && (
                          <p className="text-white/30 text-xs flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {t('settings.memberSince')} {new Date(profile.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/60 block">
                        {t('settings.displayNameLabel')}
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('settings.displayNamePlaceholder')}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        maxLength={100}
                      />
                    </div>

                    {/* Save button */}
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading || displayName === (profile?.displayName || '')}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-cyan-500/10"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {t('settings.saveChanges')}
                    </button>
                  </section>

                  {/* Divider */}
                  <hr className="border-white/[0.04]" />

                  {/* Daily Token Usage */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        {t('settings.tokenUsageTitle')}
                      </h3>
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        {profile?.plan || 'FREE'}
                      </span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between text-xs text-white/60 font-medium">
                        <span>{t('settings.tokenUsageTitle')}</span>
                        <span>{profile?.dailyTokensUsed?.toLocaleString() || 0} / {profile?.dailyTokensLimit?.toLocaleString() || 100000}</span>
                      </div>
                      <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700 ease-out',
                            tokenPercent > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                            tokenPercent > 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                            'bg-gradient-to-r from-cyan-500 to-purple-500'
                          )}
                          style={{ width: `${tokenPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/30">
                        {t('settings.usageResetsDaily')}
                      </p>
                    </div>
                  </section>

                  {/* Divider */}
                  <hr className="border-white/[0.04]" />

                  {/* Account Actions */}
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                      {t('settings.accountActionsTitle')}
                    </h3>
                    <div className="space-y-1.5">
                      <button
                        onClick={handleExportData}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-all text-start group"
                      >
                        <Download className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400" />
                        <span className="flex-1">{t('settings.exportData')}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity rtl:-scale-x-100" />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-sm text-red-400/70 hover:text-red-300 hover:bg-red-500/[0.06] transition-all text-start group"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="flex-1">{t('settings.logout')}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity rtl:-scale-x-100" />
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {/* ═══════════════ LANGUAGE TAB ═══════════════ */}
              {activeTab === 'language' && (
                <div className="space-y-5 animate-fadeIn">
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                      {t('settings.interfaceLanguageTitle')}
                    </h3>
                    <p className="text-xs text-white/40 mb-4">
                      {t('settings.interfaceLanguageDesc')}
                    </p>

                    <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 select-none no-scrollbar">
                      {languagesList.length > 0 ? (
                        languagesList.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-xl border transition-all text-start',
                              language === lang.code
                                ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/8 border-cyan-500/25 shadow-sm shadow-cyan-500/5 text-cyan-300'
                                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] text-white/70'
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">{lang.nameLocal}</p>
                              <p className="text-[10px] text-white/30 truncate mt-0.5">{lang.name}</p>
                            </div>
                            {language === lang.code && (
                              <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        // Fallback options
                        [
                          { code: 'system', name: 'System Default Setting', nameLocal: 'System Default Setting' },
                          { code: 'en', name: 'English', nameLocal: 'English' },
                          { code: 'ar', name: 'Arabic', nameLocal: 'Arabic' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-xl border transition-all text-start',
                              language === lang.code
                                ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/8 border-cyan-500/25 shadow-sm shadow-cyan-500/5 text-cyan-300'
                                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] text-white/70'
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">{lang.nameLocal}</p>
                              <p className="text-[10px] text-white/30 truncate mt-0.5">{lang.name}</p>
                            </div>
                            {language === lang.code && (
                              <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Divider */}
                  <hr className="border-white/[0.04]" />

                  {/* Current direction info */}
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                      {t('settings.currentTextDirection')}
                    </h3>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80 font-medium">{direction.toUpperCase()}</p>
                        <p className="text-[10px] text-white/30">
                          {direction === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ═══════════════ APPEARANCE TAB ═══════════════ */}
              {activeTab === 'appearance' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Theme Selection */}
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                      {t('settings.themeTitle')}
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {([
                        { id: 'dark' as const, icon: <Moon className="w-4 h-4" />, labelKey: 'settings.themeDark' },
                        { id: 'light' as const, icon: <Sun className="w-4 h-4" />, labelKey: 'settings.themeLight' },
                        { id: 'system' as const, icon: <Monitor className="w-4 h-4" />, labelKey: 'settings.themeSystem' },
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setTheme(opt.id)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                            theme === opt.id
                              ? 'bg-gradient-to-b from-cyan-500/10 to-purple-500/5 border-cyan-500/25 text-cyan-400'
                              : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                          )}
                        >
                          {opt.icon}
                          <span className="text-xs font-medium">{t(opt.labelKey)}</span>
                          {theme === opt.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] text-white/25">
                      {t('settings.themeDesc')}
                    </p>
                  </section>

                  {/* Divider */}
                  <hr className="border-white/[0.04]" />

                  {/* Font Size */}
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                      {t('settings.fontSizeTitle')}
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {([
                        { id: 'small' as const, labelKey: 'settings.fontSizeSmall', sample: 'Aa' },
                        { id: 'medium' as const, labelKey: 'settings.fontSizeMedium', sample: 'Aa' },
                        { id: 'large' as const, labelKey: 'settings.fontSizeLarge', sample: 'Aa' },
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setFontSize(opt.id)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                            fontSize === opt.id
                              ? 'bg-gradient-to-b from-cyan-500/10 to-purple-500/5 border-cyan-500/25 text-cyan-400'
                              : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                          )}
                        >
                          <span className={cn(
                            'font-bold',
                            opt.id === 'small' ? 'text-sm' : opt.id === 'medium' ? 'text-lg' : 'text-2xl'
                          )}>
                            {opt.sample}
                          </span>
                          <span className="text-xs font-medium">{t(opt.labelKey)}</span>
                          {fontSize === opt.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] text-white/25">
                      {t('settings.fontSizeDesc')}
                    </p>
                  </section>
                </div>
              )}

              {/* ═══════════════ ABOUT TAB ═══════════════ */}
              {activeTab === 'about' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* App Info */}
                  <section className="text-center py-4">
                    <Image
                      src="/logo.png"
                      alt="ChatHSM"
                      width={64}
                      height={64}
                      className="w-16 h-16 mx-auto rounded-2xl shadow-2xl shadow-cyan-500/20 mb-4 object-cover"
                    />
                    <h3 className="text-xl font-bold text-white mb-1">ChatHSM</h3>
                    <p className="text-xs text-white/40 mb-1">
                      {t('settings.aboutDesc')}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/50 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t('settings.aboutVersion')} v1.0.0
                    </div>
                  </section>

                  {/* Divider */}
                  <hr className="border-white/[0.04]" />

                  {/* Features */}
                  <section>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                      {t('settings.aboutFeaturesTitle')}
                    </h3>
                    <div className="space-y-2">
                      {[
                        'settings.feature1',
                        'settings.feature2',
                        'settings.feature3',
                        'settings.feature4',
                      ].map((featKey, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm text-white/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shrink-0" />
                          <span>{t(featKey)}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Divider */}
                  <hr className="border-white/[0.04]" />

                  {/* Security */}
                  <section>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-emerald-400/70 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-white/70 font-medium mb-1">
                          {t('settings.aboutSecureDesc')}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
