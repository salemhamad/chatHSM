import { create } from 'zustand';
import { UIState } from '../types';

interface UIStore extends UIState {
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleAttachmentMenu: () => void;
  closeAttachmentMenu: () => void;
  toggleWebSearch: () => void;
  setRecording: (isRecording: boolean) => void;
  toggleLanguage: () => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true, // true on desktop, handle mobile with CSS media queries or useEffect
  attachmentMenuOpen: false,
  webSearchEnabled: false,
  isRecording: false,
  language: 'en',
  direction: 'ltr',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleAttachmentMenu: () => set((state) => ({ attachmentMenuOpen: !state.attachmentMenuOpen })),
  closeAttachmentMenu: () => set({ attachmentMenuOpen: false }),
  toggleWebSearch: () => set((state) => ({ webSearchEnabled: !state.webSearchEnabled })),
  setRecording: (isRecording) => set({ isRecording }),
  toggleLanguage: () => set((state) => {
    const newLang = state.language === 'en' ? 'ar' : 'en';
    const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newDir;
    }
    return { language: newLang, direction: newDir };
  }),
  setDirection: (direction) => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
    }
    set({ direction });
  },
}));
