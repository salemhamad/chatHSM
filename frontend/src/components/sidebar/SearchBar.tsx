import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';

export const SearchBar: React.FC = () => {
  const [localQuery, setLocalQuery] = useState('');
  const { setSearchQuery } = useChatStore();
  const { t } = useTranslation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 start-0 pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-white/40 group-focus-within:text-brand-500 transition-colors" />
      </div>
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 block p-2.5 ps-10 rtl:pe-10 rtl:ps-2.5 placeholder-white/30 transition-all hover:bg-white/10 outline-none"
        placeholder={t('sidebar.searchPlaceholder')}
      />
    </div>
  );
};
