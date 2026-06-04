import { create } from 'zustand';

export interface Language {
  code: string;
  name: string;
  nameLocal: string;
  dir: 'ltr' | 'rtl';
}

interface I18nState {
  language: string;       // Chosen option: 'system', 'en', 'ar', etc.
  activeLanguage: string; // Evaluated active code: 'en', 'ar', etc.
  direction: 'ltr' | 'rtl';
  translations: Record<string, any>;
  languagesList: Language[];
  isLoading: boolean;
  isInitialized: boolean;
  initI18n: () => Promise<void>;
  changeLanguage: (code: string) => Promise<void>;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  language: 'en',
  activeLanguage: 'en',
  direction: 'ltr',
  translations: {},
  languagesList: [],
  isLoading: false,
  isInitialized: false,

  initI18n: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      // 1. Fetch languages list
      const langsResponse = await fetch('/locales/languages.json');
      const languages: Language[] = await langsResponse.json();
      set({ languagesList: languages });

      // 2. Determine initial language selection
      let storedLang = localStorage.getItem('chathsm-lang') || 'system';

      // 3. Resolve active language code
      let resolvedCode = 'en';
      if (storedLang === 'system') {
        resolvedCode = detectBrowserLanguage(languages);
      } else {
        const found = languages.find(l => l.code === storedLang);
        resolvedCode = found ? found.code : 'en';
      }

      // 4. Fetch translations for the active language
      const transResponse = await fetch(`/locales/${resolvedCode}.json`);
      const transData = await transResponse.json();

      // 5. Apply direction and attributes
      const activeLangConfig = languages.find(l => l.code === resolvedCode) || { dir: 'ltr' as const };
      const resolvedDir = activeLangConfig.dir;

      if (typeof document !== 'undefined') {
        document.documentElement.lang = resolvedCode;
        document.documentElement.dir = resolvedDir;
      }

      set({
        language: storedLang,
        activeLanguage: resolvedCode,
        direction: resolvedDir,
        translations: transData,
        isLoading: false,
        isInitialized: true
      });
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  changeLanguage: async (code: string) => {
    set({ isLoading: true });
    try {
      const languages = get().languagesList;
      let resolvedCode = 'en';

      if (code === 'system') {
        resolvedCode = detectBrowserLanguage(languages);
      } else {
        const found = languages.find(l => l.code === code);
        resolvedCode = found ? found.code : 'en';
      }

      // Fetch translations dynamically
      const transResponse = await fetch(`/locales/${resolvedCode}.json`);
      const transData = await transResponse.json();

      const activeLangConfig = languages.find(l => l.code === resolvedCode) || { dir: 'ltr' as const };
      const resolvedDir = activeLangConfig.dir;

      if (typeof document !== 'undefined') {
        document.documentElement.lang = resolvedCode;
        document.documentElement.dir = resolvedDir;
      }

      localStorage.setItem('chathsm-lang', code);

      set({
        language: code,
        activeLanguage: resolvedCode,
        direction: resolvedDir,
        translations: transData,
        isLoading: false
      });

      // Synchronize with User Store if available
      try {
        const { useUserStore } = await import('./userStore');
        const userStore = useUserStore.getState();
        if (userStore.profile) {
          await userStore.updateProfile({ language: code });
        }
      } catch (e) {
        // User store might not be ready or needed in testing
      }
    } catch (error) {
      console.error(`Failed to change language to ${code}:`, error);
      set({ isLoading: false });
    }
  }
}));

// Helper to match browser locale to supported list
function detectBrowserLanguage(languages: Language[]): string {
  if (typeof navigator === 'undefined') return 'en';

  const browserLocales = [
    navigator.language,
    ...(navigator.languages || [])
  ];

  for (const locale of browserLocales) {
    if (!locale) continue;

    // Direct match (e.g. es-ES matches es-ES, zh-TW matches zh-TW)
    const exactMatch = languages.find(l => l.code.toLowerCase() === locale.toLowerCase() && l.code !== 'system');
    if (exactMatch) return exactMatch.code;

    // Prefix match (e.g. fr-FR matches fr, ar-EG matches ar)
    const prefix = locale.split('-')[0].toLowerCase();
    const prefixMatch = languages.find(l => l.code.toLowerCase() === prefix && l.code !== 'system');
    if (prefixMatch) return prefixMatch.code;
  }

  return 'en'; // default fallback
}
