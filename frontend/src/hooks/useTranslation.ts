import { useI18nStore } from '../stores/i18nStore';

export function useTranslation() {
  const i18n = useI18nStore();

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let current: any = i18n.translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Key not found in active language, return the key itself as a fallback
        return key;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    // Replace variables (e.g. {{name}})
    let result = current;
    if (variables) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        result = result.replace(new RegExp(`{{${vKey}}}`, 'g'), String(vVal));
      });
    }

    return result;
  };

  return {
    t,
    language: i18n.language,
    activeLanguage: i18n.activeLanguage,
    direction: i18n.direction,
    changeLanguage: i18n.changeLanguage,
    languagesList: i18n.languagesList,
    isLoading: i18n.isLoading
  };
}
