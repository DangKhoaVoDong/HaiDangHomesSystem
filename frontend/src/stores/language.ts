import { create } from 'zustand';

interface LanguageState {
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'vi',
  setLanguage: (language) => set({ language }),
}));
